'use client'

import { useTicketSearch } from './TicketSearchProvider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const getPriorityStyle = (priority: string | null) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'normal':
      return 'bg-blue-500'
    case 'low':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const getStateStyle = (state: string) => {
  switch (state.toLowerCase()) {
    case 'open':
      return 'bg-green-500'
    case 'in_progress':
      return 'bg-blue-500'
    case 'blocked':
      return 'bg-red-500'
    case 'closed':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

export default function TicketTable({ canViewDetails }: { canViewDetails: boolean }) {
  const { results, isLoading, error, performSearch } = useTicketSearch()
  const [ticketTypes, setTicketTypes] = useState<Record<string, string>>({})
  const supabase = createClient()

  // Load ticket types
  useEffect(() => {
    async function loadTicketTypes() {
      const { data } = await supabase
        .from('ticket_type')
        .select('id, name')
      
      if (data) {
        const types = Object.fromEntries(data.map(type => [type.id, type.name]))
        setTicketTypes(types)
      }
    }

    loadTicketTypes()
  }, [])

  // Load initial data
  useEffect(() => {
    performSearch()
  }, [performSearch])

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading tickets...
      </div>
    )
  }

  if (!results?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No tickets found
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">
                {canViewDetails ? (
                  <Link 
                    href={`/protected/tickets/${ticket.id}`}
                    className="hover:underline text-primary"
                  >
                    {ticket.title}
                  </Link>
                ) : (
                  ticket.title
                )}
              </TableCell>
              <TableCell>
                {ticket.type ? ticketTypes[ticket.type] || 'Unknown' : 'N/A'}
              </TableCell>
              <TableCell>
                {new Date(ticket.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </TableCell>
              <TableCell>
                <Badge className={getStateStyle(ticket.STATE)}>{ticket.STATE}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityStyle(ticket.priority[0]?.value)}>
                  {ticket.priority[0]?.value || 'N/A'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 