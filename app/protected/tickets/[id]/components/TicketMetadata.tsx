'use client'

import { createClient } from '@/utils/supabase/client'
import { Tables } from '@/utils/supabase/supabase'
import { useEffect, useState } from 'react'

type Ticket = Tables<'ticket'>
type MetadataType = Tables<'metadata_type'>
type MetadataValue = Tables<'metadata_value'>

type MetadataTypeResponse = {
  metadata_type: string
  metadata_type_details: MetadataType
}

export default function TicketMetadata({ ticket }: { ticket: Ticket }) {
  const [metadata, setMetadata] = useState<Array<{
    type: MetadataType,
    value: MetadataValue
  }>>([])
  
  const supabase = createClient()

  useEffect(() => {
    async function loadMetadata() {
      if (!ticket.type) return

      // First get all metadata types for this ticket type
      const { data: metadataTypes } = await supabase
        .from('ticket_type_metadata_type')
        .select(`
          metadata_type,
          metadata_type_details:metadata_type(*)
        `)
        .eq('ticket_type', ticket.type)
        .returns<MetadataTypeResponse[]>()

      if (!metadataTypes) return

      // Then get all metadata values for this ticket
      const { data: metadataValues } = await supabase
        .from('metadata_value')
        .select('*')
        .eq('ticket_id', ticket.id)
        .in('metadata_type', metadataTypes.map(t => t.metadata_type))

      // Combine the data
      const combined = metadataTypes.map(type => ({
        type: type.metadata_type_details,
        value: metadataValues?.find(v => v.metadata_type === type.metadata_type) || {
          metadata_type: type.metadata_type,
          ticket_id: ticket.id,
          value: ''
        }
      }))

      setMetadata(combined)
    }

    loadMetadata()
  }, [ticket.id, ticket.type])

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold">Ticket Metadata</h2>
      <div className="space-y-4">
        {metadata.map(item => (
          <div key={item.type.id}>
            <div className="text-sm text-muted-foreground">{item.type.name}</div>
            <div className="font-medium">
              {item.value.value || 'Not set'}
            </div>
          </div>
        ))}
        {metadata.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No metadata available for this ticket type
          </div>
        )}
      </div>
    </div>
  )
} 