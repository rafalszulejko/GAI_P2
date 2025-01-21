'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Tables } from '@/utils/supabase/supabase'

type Ticket = Tables<'ticket'>

export default function TicketInformation({ ticket }: { ticket: Ticket }) {
  const [creatorName, setCreatorName] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadCreator() {
      const { data } = await supabase
        .from('customer_user')
        .select('name')
        .eq('user_id', ticket.created_by)
        .single()

      setCreatorName(data?.name || 'Unknown')
    }

    loadCreator()
  }, [ticket.created_by])

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold">Ticket Information</h2>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Title</div>
          <div className="font-medium">{ticket.title}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Created By</div>
          <div className="font-medium">{creatorName}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Created At</div>
          <div className="font-medium">
            {new Date(ticket.created_at).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 