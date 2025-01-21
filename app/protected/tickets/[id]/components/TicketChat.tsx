'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Tables } from '@/utils/supabase/supabase'

type Message = Tables<'message'>

export default function TicketChat({ ticketId }: { ticketId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadMessages() {
      try {
        const { data, error } = await supabase
          .from('message')
          .select('*')
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

    loadMessages()
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
              <div className="text-sm text-muted-foreground">
                {new Date(message.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </div>
              <div className="mt-1">{message.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 