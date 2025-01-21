'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/utils/supabase/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type TicketType = Database['public']['Tables']['ticket_type']['Row']
type MetadataType = Database['public']['Tables']['metadata_type']['Row']
type MetadataDict = Database['public']['Tables']['metadata_dict']['Row']

interface CreateTicketFormProps {
  ticketTypes: TicketType[]
  metadataTypes: Record<string, MetadataType[]>
  metadataDictValues: Record<string, MetadataDict[]>
}

export function CreateTicketForm({ ticketTypes, metadataTypes, metadataDictValues }: CreateTicketFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMetadataChange = (metadataType: string, value: string) => {
    setMetadataValues(prev => ({
      ...prev,
      [metadataType]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return

    setIsSubmitting(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Insert ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('ticket')
        .insert({
          title,
          description,
          type: selectedType,
          created_by: user.id,
          STATE: 'OPEN'
        })
        .select()
        .single()

      if (ticketError) throw ticketError
      if (!ticket) throw new Error('No ticket created')

      // Insert metadata values
      if (Object.keys(metadataValues).length > 0) {
        const metadataInserts = Object.entries(metadataValues).map(([type, value]) => ({
          ticket_id: ticket.id,
          metadata_type: type,
          value
        }))

        const { error: metadataError } = await supabase
          .from('metadata_value')
          .insert(metadataInserts)

        if (metadataError) throw metadataError
      }

      // Redirect to the new ticket
      router.push(`/protected/tickets/${ticket.id}`)
    } catch (error) {
      console.error('Error creating ticket:', error)
      // Here you would typically show an error message to the user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter ticket title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Enter ticket description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={selectedType || ''} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Select ticket type" />
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

      {selectedType && metadataTypes[selectedType] && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Metadata</h2>
          {metadataTypes[selectedType].map((metadata) => (
            <div key={metadata.id} className="space-y-2">
              <Label htmlFor={metadata.id}>{metadata.name}</Label>
              {metadata.type === 'TEXT' ? (
                <Input
                  id={metadata.id}
                  value={metadataValues[metadata.id] || ''}
                  onChange={(e) => handleMetadataChange(metadata.id, e.target.value)}
                  required
                />
              ) : (
                <Select
                  value={metadataValues[metadata.id] || ''}
                  onValueChange={(value) => handleMetadataChange(metadata.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${metadata.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {metadataDictValues[metadata.id]?.map((dict) => (
                      <SelectItem key={dict.value} value={dict.value}>
                        {dict.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Ticket'}
      </Button>
    </form>
  )
} 