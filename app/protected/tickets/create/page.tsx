import { guardRoute } from '@/utils/permissions'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/utils/supabase/supabase'
import { CreateTicketForm } from './components/CreateTicketForm'

export default async function CreateTicketPage() {
  // Guard the create ticket page
  await guardRoute('ticket.list.create')

  const supabase = await createClient()

  // Fetch all ticket types
  const { data: ticketTypes } = await supabase
    .from('ticket_type')
    .select('*')

  // Fetch metadata types for all ticket types
  const { data: ticketTypeMetadata } = await supabase
    .from('ticket_type_metadata_type')
    .select(`
      ticket_type,
      metadata_type,
      metadata_type_details:metadata_type(*)
    `)

  // Fetch all metadata dict values
  const { data: metadataDictValues } = await supabase
    .from('metadata_dict')
    .select('*')

  // Organize metadata types by ticket type
  const metadataTypes: Record<string, Database['public']['Tables']['metadata_type']['Row'][]> = {}
  ticketTypeMetadata?.forEach((ttm: any) => {
    if (!metadataTypes[ttm.ticket_type]) {
      metadataTypes[ttm.ticket_type] = []
    }
    if (ttm.metadata_type_details) {
      metadataTypes[ttm.ticket_type].push(ttm.metadata_type_details)
    }
  })

  // Organize metadata dict values by metadata type
  const metadataDictByType: Record<string, Database['public']['Tables']['metadata_dict']['Row'][]> = {}
  metadataDictValues?.forEach((mdv: any) => {
    if (!metadataDictByType[mdv.metadata_type]) {
      metadataDictByType[mdv.metadata_type] = []
    }
    metadataDictByType[mdv.metadata_type].push(mdv)
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Ticket</h1>
      <CreateTicketForm
        ticketTypes={ticketTypes || []}
        metadataTypes={metadataTypes}
        metadataDictValues={metadataDictByType}
      />
    </div>
  )
} 