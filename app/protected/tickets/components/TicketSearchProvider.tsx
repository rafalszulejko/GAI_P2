'use client'

import { createClient } from '@/utils/supabase/client'
import { createContext, useContext, useState, useCallback } from 'react'

type SearchParams = {
  title?: string
  createdBefore?: string
  createdAfter?: string
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

export default function TicketSearchProvider({ children }: { children: React.ReactNode }) {
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
        .select('*')
        .order('created_at', { ascending: false })

      if (searchParams.title) {
        query = query.ilike('title', `%${searchParams.title}%`)
      }

      if (searchParams.createdBefore) {
        query = query.lte('created_at', searchParams.createdBefore)
      }

      if (searchParams.createdAfter) {
        query = query.gte('created_at', searchParams.createdAfter)
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
  }, [searchParams])

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