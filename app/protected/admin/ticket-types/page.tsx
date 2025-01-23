import { guardRoute, getUserPermissions } from "@/utils/permissions"
import TicketTypeTable from './components/TicketTypeTable'

export default async function TicketTypesPage() {
  await guardRoute('admin.tickettype.view')
  
  // Get permissions for conditional rendering
  const permissions = await getUserPermissions()
  const canEdit = permissions.includes('admin.tickettype.edit')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ticket Types Management</h1>
        <p className="text-muted-foreground">Configure and manage ticket types and their custom fields.</p>
      </div>
      
      <TicketTypeTable canEdit={canEdit} />
    </div>
  )
} 