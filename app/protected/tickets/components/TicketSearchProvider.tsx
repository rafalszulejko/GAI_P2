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
  isCustomer 
}: { 
  children: React.ReactNode
  isCustomer: boolean 
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

      // If user is a customer, only show their tickets
      if (isCustomer) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          query = query.eq('created_by', user.id)
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

      if (searchParams.assignee) {
        query = query.eq('assignee', searchParams.assignee)
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
  }, [searchParams, isCustomer])

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