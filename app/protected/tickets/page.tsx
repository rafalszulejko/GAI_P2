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
  const isCustomer = userRole === 'customer'
  
  const canSearch = permissions.includes('ticket.list.search')
  const canViewDetails = permissions.includes('ticket.details')
  const canCreate = permissions.includes('ticket.list.create')

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
      
      <TicketSearchProvider isCustomer={isCustomer}>
        {canSearch && (
          <Suspense fallback={<div>Loading search form...</div>}>
            <TicketSearchForm />
          </Suspense>
        )}
        
        <Suspense fallback={<div>Loading tickets...</div>}>
          <TicketTable canViewDetails={canViewDetails} />
        </Suspense>
      </TicketSearchProvider>
    </div>
  )
} 