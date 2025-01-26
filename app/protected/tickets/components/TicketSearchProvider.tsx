'use client'

import { createClient } from '@/utils/supabase/client'
import { createContext, useContext, useState, useCallback } from 'react'

type SearchParams = {
  title?: string
  createdBefore?: string
  createdAfter?: string
  type?: string
  createdBy?: string
  assignee?: string
  state?: string
  priority?: string
  teams?: string[]
}

type SearchContextType = {
  searchParams: SearchParams
  results: any[] | null
  isLoading: boolean
  error: string | null
  setSearchParams: (params: SearchParams) => void
  performSearch: () => Promise<void>
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function useTicketSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useTicketSearch must be used within a TicketSearchProvider')
  }
  return context
}

export default function TicketSearchProvider({ 
  children,
  role 
}: { 
  children: React.ReactNode
  role: 'customer' | 'employee' | 'admin'
}) {
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [results, setResults] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSearch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      let query = supabase
        .from('ticket')
        .select(`
          *,
          priority:metadata_value!inner(value)
        `)
        .eq('metadata_value.metadata_type', 'PRIORITY')
        .order('created_at', { ascending: false })

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Apply role-specific filters
        switch (role) {
          case 'customer':
            query = query.eq('created_by', user.id)
            break
          case 'employee':
            let assigneeIds = [user.id]
            
            if (searchParams.teams && searchParams.teams.length > 0) {
              const { data: teamMembers } = await supabase
                .from('team_member')
                .select('user_id')
                .in('team_id', searchParams.teams)
              
              if (teamMembers) {
                const teamMemberIds = teamMembers.map(member => member.user_id)
                assigneeIds = Array.from(new Set([...assigneeIds, ...teamMemberIds]))
              }
            }
            
            query = query.in('assignee', assigneeIds)
            break
          case 'admin':
            // No restrictions for admin
            break
        }
      }

      if (searchParams.title) {
        query = query.ilike('title', `%${searchParams.title}%`)
      }

      if (searchParams.createdBefore) {
        query = query.lte('created_at', searchParams.createdBefore)
      }

      if (searchParams.createdAfter) {
        query = query.gte('created_at', searchParams.createdAfter)
      }

      if (searchParams.type) {
        query = query.eq('type', searchParams.type)
      }

      if (searchParams.createdBy) {
        query = query.eq('created_by', searchParams.createdBy)
      }

      if (searchParams.state) {
        query = query.eq('STATE', searchParams.state)
      }

      if (searchParams.priority) {
        const { data: metadataValues } = await supabase
          .from('metadata_value')
          .select('ticket_id')
          .eq('metadata_type', 'PRIORITY')
          .eq('value', searchParams.priority)

        if (metadataValues && metadataValues.length > 0) {
          const ticketIds = metadataValues.map(mv => mv.ticket_id)
          query = query.in('id', ticketIds)
        } else {
          // If no tickets have the selected priority value, return no results
          setResults([])
          return
        }
      }

      const { data, error: searchError } = await query

      if (searchError) {
        throw searchError
      }

      setResults(data)
    } catch (err) {
      console.error('Error searching tickets:', err)
      setError('Failed to search tickets')
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, role])

  const value = {
    searchParams,
    results,
    isLoading,
    error,
    setSearchParams,
    performSearch
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
} 