'use client'

import { useTicketSearch } from './TicketSearchProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Tables } from '@/utils/supabase/supabase'

type TicketType = Tables<'ticket_type'>

export default function TicketSearchForm() {
  const { searchParams, setSearchParams, performSearch } = useTicketSearch()
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadTicketTypes() {
      const { data } = await supabase
        .from('ticket_type')
        .select('*')
        .order('name')
      
      setTicketTypes(data || [])
    }

    loadTicketTypes()
  }, [])

  const handleReset = () => {
    setSearchParams({})
    performSearch()
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Search by title..."
            value={searchParams.title || ''}
            onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={searchParams.type || ''}
            onValueChange={(value) => setSearchParams({ ...searchParams, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ticketTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="createdAfter">Created After</Label>
          <Input
            id="createdAfter"
            type="date"
            value={searchParams.createdAfter || ''}
            onChange={(e) => setSearchParams({ ...searchParams, createdAfter: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="createdBefore">Created Before</Label>
          <Input
            id="createdBefore"
            type="date"
            value={searchParams.createdBefore || ''}
            onChange={(e) => setSearchParams({ ...searchParams, createdBefore: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset filters
        </Button>
        <Button onClick={performSearch}>
          Search Tickets
        </Button>
      </div>
    </div>
  )
} 