'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Tables } from '@/utils/supabase/supabase'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type CustomerDetails = {
  name: string | null
  email: string | null
  companyName: string | null
}

type TicketSummary = Pick<Tables<'ticket'>, 'id' | 'title' | 'created_at'>
type UserProfile = Tables<'user_profile'>

export default function CustomerContext({ 
  userId,
  userProfile,
  canViewCustomerDetails
}: { 
  userId: string
  userProfile: UserProfile | null
  canViewCustomerDetails: boolean
}) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null)
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadCustomerContext() {
      try {
        // Load customer details
        const { data: customerUser } = await supabase
          .from('customer_user')
          .select('customer_id')
          .eq('user_id', userId)
          .single()
        
        // Load company name if we have customer_id
        let companyName = null
        if (customerUser?.customer_id) {
          const { data: customerOrg } = await supabase
            .from('customer_org')
            .select('name')
            .eq('id', customerUser.customer_id)
            .single()
          companyName = customerOrg?.name
        }

        setCustomerDetails({
          name: userProfile?.name || null,
          email: userProfile?.email || null,
          companyName
        })

        // Load conversation history
        const { data: ticketHistory } = await supabase
          .from('ticket')
          .select('id, title, created_at')
          .eq('created_by', userId)
          .order('created_at', { ascending: false })

        setTickets(ticketHistory || [])
      } catch (e) {
        setError('Failed to load customer context')
        console.error('Error loading customer context:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomerContext()
  }, [userId, userProfile])

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading customer context...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Customer Details Section */}
      <div className="p-6 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Customer Details</h2>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="font-medium">
              {canViewCustomerDetails ? (
                <Link 
                  href={`/protected/customers/${userId}`}
                  className="hover:underline text-primary"
                >
                  {customerDetails?.name || 'N/A'}
                </Link>
              ) : (
                <span>{customerDetails?.name || 'N/A'}</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{customerDetails?.email || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Company</div>
            <div className="font-medium">{customerDetails?.companyName || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Conversation History Section */}
      <div className="p-6 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Conversation History</h2>
        {tickets.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No previous tickets
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Link 
                      href={`/protected/tickets/${ticket.id}`}
                      className="hover:underline text-primary"
                    >
                      {ticket.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
} 