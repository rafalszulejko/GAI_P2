import { guardRoute, getUserPermissions, getUserRole } from '@/utils/permissions'
import { Suspense } from 'react'
import TicketTable from './components/TicketTable'
import TicketSearchForm from './components/TicketSearchForm'
import TicketSearchProvider from './components/TicketSearchProvider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function TicketsPage() {
  // Guard the entire page with view permission
  await guardRoute('ticket.list.view')
  
  // Get permissions for conditional rendering
  const permissions = await getUserPermissions()
  const userRole = await getUserRole()
  
  const canSearch = permissions.includes('ticket.list.search')
  const canViewDetails = permissions.includes('ticket.details')
  const canCreate = permissions.includes('ticket.list.create')
  const canViewTeams = permissions.includes('ticket.team.view')
  const canViewUsers = permissions.includes('admin.users.view')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tickets</h1>
        {canCreate && (
          <Link href="/protected/tickets/create">
            <Button>Create</Button>
          </Link>
        )}
      </div>
      
      <TicketSearchProvider role={userRole as 'customer' | 'employee' | 'admin'}>
        {canSearch && (
          <Suspense fallback={<div>Loading search form...</div>}>
            <TicketSearchForm canViewTeams={canViewTeams} canViewUsers={canViewUsers} />
          </Suspense>
        )}
        
        <Suspense fallback={<div>Loading tickets...</div>}>
          <TicketTable canViewDetails={canViewDetails} />
        </Suspense>
      </TicketSearchProvider>
    </div>
  )
} 