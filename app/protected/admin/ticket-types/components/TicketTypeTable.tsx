'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/utils/supabase/client'
import { Tables } from '@/utils/supabase/supabase'
import { MetadataFieldList } from './MetadataFieldList'
import { AddMetadataField } from './AddMetadataField'
import { AddTicketTypeDialog } from './AddTicketTypeDialog'

type TicketType = Tables<'ticket_type'>
type MetadataType = Tables<'metadata_type'>

interface TicketTypeTableProps {
  canEdit: boolean
}

export default function TicketTypeTable({ canEdit }: TicketTypeTableProps) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [metadataTypes, setMetadataTypes] = useState<MetadataType[]>([])
  const [ticketTypeMetadata, setTicketTypeMetadata] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load ticket types and their metadata
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load ticket types
      const { data: types, error: typesError } = await supabase
        .from('ticket_type')
        .select('*')
      
      if (typesError) throw typesError

      // Load metadata types
      const { data: metadata, error: metadataError } = await supabase
        .from('metadata_type')
        .select('*')
      
      if (metadataError) throw metadataError

      // Load ticket type metadata relationships
      const { data: typeMetadata, error: typeMetadataError } = await supabase
        .from('ticket_type_metadata_type')
        .select('*')
      
      if (typeMetadataError) throw typeMetadataError

      // Process the data
      setTicketTypes(types || [])
      setMetadataTypes(metadata || [])
      
      // Create a map of ticket type ID to metadata type IDs
      const metadataMap: Record<string, string[]> = {}
      typeMetadata?.forEach(tm => {
        if (!metadataMap[tm.ticket_type]) {
          metadataMap[tm.ticket_type] = []
        }
        metadataMap[tm.ticket_type].push(tm.metadata_type)
      })
      setTicketTypeMetadata(metadataMap)
      
    } catch (err) {
      console.error('Error loading ticket types:', err)
      setError('Failed to load ticket types')
    } finally {
      setLoading(false)
    }
  }

  // Handle removing a metadata type from a ticket type
  const handleRemoveMetadata = async (ticketTypeId: string, metadataTypeId: string) => {
    if (!canEdit) return

    try {
      const { error } = await supabase
        .from('ticket_type_metadata_type')
        .delete()
        .eq('ticket_type', ticketTypeId)
        .eq('metadata_type', metadataTypeId)

      if (error) throw error

      // Update local state
      setTicketTypeMetadata(prev => ({
        ...prev,
        [ticketTypeId]: prev[ticketTypeId].filter(id => id !== metadataTypeId)
      }))

    } catch (err) {
      console.error('Error removing metadata type:', err)
      setError('Failed to remove metadata type')
    }
  }

  // Handle adding a metadata type to a ticket type
  const handleAddMetadata = async (ticketTypeId: string, metadataTypeId: string) => {
    if (!canEdit) return

    try {
      const { error } = await supabase
        .from('ticket_type_metadata_type')
        .insert([
          { ticket_type: ticketTypeId, metadata_type: metadataTypeId }
        ])

      if (error) throw error

      // Update local state
      setTicketTypeMetadata(prev => ({
        ...prev,
        [ticketTypeId]: [...(prev[ticketTypeId] || []), metadataTypeId]
      }))

    } catch (err) {
      console.error('Error adding metadata type:', err)
      setError('Failed to add metadata type')
    }
  }

  // Handle adding a new ticket type
  const handleAddTicketType = async (id: string, name: string) => {
    if (!canEdit) return

    try {
      const { error } = await supabase
        .from('ticket_type')
        .insert([{ id, name }])

      if (error) throw error

      // Reload data to get the new ticket type
      await loadData()

    } catch (err) {
      console.error('Error adding ticket type:', err)
      throw new Error('Failed to add ticket type')
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading ticket types...</div>
  }

  if (error) {
    return <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Ticket Types</h2>
        {canEdit && <AddTicketTypeDialog onAdd={handleAddTicketType} />}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Custom Fields</TableHead>
              {canEdit && <TableHead>Add Custom Field</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticketTypes.map((type) => {
              const typeMetadataIds = ticketTypeMetadata[type.id] || []
              const typeMetadataFields = metadataTypes.filter(m => typeMetadataIds.includes(m.id))
              const availableMetadataFields = metadataTypes.filter(m => !typeMetadataIds.includes(m.id))

              return (
                <TableRow key={type.id}>
                  <TableCell className="font-mono text-sm">{type.id}</TableCell>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>
                    <MetadataFieldList 
                      fields={typeMetadataFields}
                      onRemoveField={(fieldId) => handleRemoveMetadata(type.id, fieldId)}
                      canEdit={canEdit}
                    />
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <AddMetadataField 
                        availableFields={availableMetadataFields}
                        onAddField={(fieldId) => handleAddMetadata(type.id, fieldId)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 