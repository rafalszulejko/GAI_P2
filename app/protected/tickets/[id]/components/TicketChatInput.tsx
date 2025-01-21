'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/form-message'

export default function TicketChatInput({ ticketId }: { ticketId: string }) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('message')
        .insert([
          {
            ticket_id: ticketId,
            content: message.trim(),
          },
        ])

      if (insertError) throw insertError

      setMessage('')
    } catch (e) {
      console.error('Error sending message:', e)
      setError('Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !message.trim()}>
          Send
        </Button>
      </div>
      {error && <FormMessage message={{ error }} />}
    </form>
  )
} 