'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Tables } from '@/utils/supabase/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import Markdown from 'react-markdown'

type UserProfile = Pick<Tables<'user_profile'>, 'id' | 'name' | 'email'>

type Message = Tables<'message'> & {
  user_profile: UserProfile | null
}

export default function TicketChat({ ticketId }: { ticketId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    async function loadMessages() {
      try {
        const { data, error } = await supabase
          .from('message')
          .select(`
            *,
            user_profile:created_by(
              id,
              name,
              email
            )
          `)
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data || [])
      } catch (e) {
        setError('Failed to load messages')
        console.error('Error loading messages:', e)
      } finally {
        setIsLoading(false)
      }
    }

    async function setupSubscription() {
      channel = supabase
        .channel(`ticket-messages-${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'message',
            filter: `ticket_id=eq.${ticketId}`
          },
          async (payload) => {
            const newMessage = payload.new as Tables<'message'>
            // Fetch user profile for the new message
            const { data: userProfile } = await supabase
              .from('user_profile')
              .select('id, name, email')
              .eq('id', newMessage.created_by)
              .single()
            
            setMessages((currentMessages) => [
              ...currentMessages, 
              { ...newMessage, user_profile: userProfile as UserProfile }
            ])
          }
        )
        .subscribe()
    }

    loadMessages()
    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [ticketId])

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading messages...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold">Chat</h2>
      
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No messages yet
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {message.user_profile?.name || message.user_profile?.email || 'Unknown user'}
                </span>
                <span>
                  {new Date(message.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
              <div className="mt-1 prose prose-sm dark:prose-invert max-w-none">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 