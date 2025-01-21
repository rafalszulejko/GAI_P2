import { guardRoute, getUserPermissions } from '@/utils/permissions'
import { Suspense } from 'react'
import TicketTable from './components/TicketTable'
import TicketSearchForm from './components/TicketSearchForm'
import TicketSearchProvider from './components/TicketSearchProvider'

export default async function TicketsPage() {
  // Guard the entire page with view permission
  await guardRoute('ticket.list.view')
  
  // Get permissions for conditional rendering
  const permissions = await getUserPermissions()
  const canSearch = permissions.includes('ticket.list.search')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Tickets</h1>
      
      <TicketSearchProvider>
        {canSearch && (
          <Suspense fallback={<div>Loading search form...</div>}>
            <TicketSearchForm />
          </Suspense>
        )}
        
        <Suspense fallback={<div>Loading tickets...</div>}>
          <TicketTable />
        </Suspense>
      </TicketSearchProvider>
    </div>
  )
} 