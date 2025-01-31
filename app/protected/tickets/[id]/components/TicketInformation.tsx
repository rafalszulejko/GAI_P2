'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Tables } from '@/utils/supabase/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type Ticket = Tables<'ticket'>
type UserProfile = Tables<'user_profile'>

export default function TicketInformation({ 
  ticket,
  allowedStates,
  assigneeProfile,
  creatorProfile,
  canViewCustomerDetails
}: { 
  ticket: Ticket
  allowedStates: string[]
  assigneeProfile: UserProfile | null
  creatorProfile: UserProfile | null
  canViewCustomerDetails: boolean
}) {
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const handleStateChange = async (newState: string) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('ticket')
        .update({ STATE: newState })
        .eq('id', ticket.id)

      if (error) throw error

      // Refresh the page to show updated state
      window.location.reload()
    } catch (e) {
      console.error('Error updating ticket state:', e)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h2 className="text-2xl font-semibold">Ticket Information</h2>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Title</div>
          <div className="font-medium">{ticket.title}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Description</div>
          <div className="font-medium whitespace-pre-wrap">{ticket.description || 'No description provided'}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">State</div>
          <div className="font-medium">
            <Badge variant="outline">{ticket.STATE}</Badge>
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Created By</div>
          <div className="font-medium">
            {canViewCustomerDetails ? (
              <Link 
                href={`/protected/customers/${ticket.created_by}`}
                className="hover:underline text-primary"
              >
                {creatorProfile?.name || creatorProfile?.email || 'Unknown'}
              </Link>
            ) : (
              <span>{creatorProfile?.name || creatorProfile?.email || 'Unknown'}</span>
            )}
          </div>
        </div>

        {ticket.assignee && (
          <div>
            <div className="text-sm text-muted-foreground">Assigned To</div>
            <div className="font-medium">
              {assigneeProfile?.name || assigneeProfile?.email || 'Unknown'}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-muted-foreground">Created At</div>
          <div className="font-medium">
            {new Date(ticket.created_at).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
        </div>

        {allowedStates.length > 0 && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">Move to state</div>
            <div className="flex flex-wrap gap-2">
              {allowedStates
                .filter(state => state !== ticket.STATE)
                .map(state => (
                <Button
                  key={state}
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleStateChange(state)}
                >
                  {state}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 