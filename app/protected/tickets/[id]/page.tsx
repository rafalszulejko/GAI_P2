import { guardRoute, getUserPermissions } from '@/utils/permissions'
import { createClient } from '@/utils/supabase/server'
import TicketMetadata from './components/TicketMetadata'
import TicketChat from './components/TicketChat'
import CustomerContext from './components/CustomerContext'

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Guard the page with ticket.details permission
  await guardRoute('ticket.details')
  
  // Get permissions for conditional rendering
  const permissions = await getUserPermissions()
  const canViewChat = permissions.includes('ticket.chat.view')
  const canViewCustomerContext = permissions.includes('ticket.customercontext.view')

  // Fetch ticket data
  const supabase = await createClient()
  const { data: ticket, error } = await supabase
    .from('ticket')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ticket) {
    return (
      <div className="container mx-auto py-6">
        <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">
          Ticket not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Ticket Metadata */}
        <div className="col-span-3">
          <TicketMetadata ticket={ticket} />
        </div>

        {/* Center column - Chat */}
        <div className="col-span-6">
          {canViewChat ? (
            <TicketChat ticketId={id} />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              You don't have permission to view the chat
            </div>
          )}
        </div>

        {/* Right column - Customer Context */}
        <div className="col-span-3">
          {canViewCustomerContext ? (
            <CustomerContext userId={ticket.created_by} />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              You don't have permission to view customer context
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 