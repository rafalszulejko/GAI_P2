'use client'

import { useTicketSearch } from './TicketSearchProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TicketSearchForm() {
  const { searchParams, setSearchParams, performSearch } = useTicketSearch()

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="grid gap-4 md:grid-cols-3">
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

      <div className="flex justify-end">
        <Button onClick={performSearch}>
          Search Tickets
        </Button>
      </div>
    </div>
  )
} 