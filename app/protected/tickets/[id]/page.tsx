import { guardRoute, getUserPermissions, getUserRole } from '@/utils/permissions'
import { createClient } from '@/utils/supabase/server'
import TicketMetadata from './components/TicketMetadata'
import TicketInformation from './components/TicketInformation'
import TicketChat from './components/TicketChat'
import CustomerContext from './components/CustomerContext'
import TicketChatInput from './components/TicketChatInput'

function computeAllowedStates(currentState: string, userRole: string): string[] {
  if (userRole === 'employee') {
    if (currentState === 'NEW') return ['OPEN']
    if (currentState === 'OPEN') return ['PENDING']
    return []
  }
  
  if (userRole === 'customer') {
    if (currentState === 'PENDING') return ['OPEN', 'SOLVED']
    return []
  }
  
  if (userRole === 'admin') {
    return ['OPEN', 'PENDING', 'CLOSED']
  }
  
  return []
}

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
  const userRole = await getUserRole()
  const canViewChat = permissions.includes('ticket.chat.view')
  const canViewCustomerContext = permissions.includes('ticket.customercontext.view')
  const canViewTicketInfo = permissions.includes('ticket.info.view')
  const canViewTicketMetadata = permissions.includes('ticket.metadata.view')
  const canReplyToChat = permissions.includes('ticket.chat.reply')
  const canEditState = permissions.includes('ticket.state.edit')

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

  // Ensure ticket.STATE exists and is a string
  if (!ticket.STATE || !userRole) {
    return (
      <div className="container mx-auto py-6">
        <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">
          Invalid ticket state or user role
        </div>
      </div>
    )
  }

  const allowedStates = canEditState ? computeAllowedStates(ticket.STATE, userRole) : []

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Ticket Information and Metadata */}
        <div className="col-span-3 space-y-6">
          {canViewTicketInfo ? (
            <TicketInformation 
              ticket={ticket} 
              allowedStates={allowedStates}
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              You don't have permission to view ticket information
            </div>
          )}
          {canViewTicketMetadata ? (
            <TicketMetadata ticket={ticket} />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              You don't have permission to view ticket metadata
            </div>
          )}
        </div>

        {/* Center column - Chat */}
        <div className="col-span-6">
          {canViewChat ? (
            <div className="space-y-4">
              <TicketChat ticketId={id} />
              {canReplyToChat && ticket.STATE !== 'CLOSED' && (
                <TicketChatInput ticketId={id} />
              )}
            </div>
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