'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/form-message'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from '@/lib/utils'

type MessageType = 'public' | 'internal'

export default function TicketChatInput({ 
  ticketId,
  canViewInternalChat
}: { 
  ticketId: string
  canViewInternalChat: boolean 
}) {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('public')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          content: message.trim(),
          type: messageType
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setMessage('')
    } catch (e) {
      console.error('Error sending message:', e)
      setError(e instanceof Error ? e.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isInternal = messageType === 'internal'

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isSubmitting}
          className={cn(
            isInternal && "border-orange-500 focus-visible:ring-orange-500"
          )}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || !message.trim()}
          className={cn(
            isInternal && "bg-orange-500 hover:bg-orange-600"
          )}
        >
          Send
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={messageType}
          onValueChange={(value) => setMessageType(value as MessageType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Message type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public message</SelectItem>
            {canViewInternalChat && (
              <SelectItem value="internal">Internal note</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      {error && <FormMessage message={{ error }} />}
    </form>
  )
} 