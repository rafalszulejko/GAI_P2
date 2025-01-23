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
import { Tables, Enums } from '@/utils/supabase/supabase'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DictValuesDialog } from './DictValuesDialog'

type MetadataType = Tables<'metadata_type'>
type MetadataTypeType = Enums<'metadata_type_type'>

interface MetadataTypeTableProps {
  canEdit: boolean
}

export default function MetadataTypeTable({ canEdit }: MetadataTypeTableProps) {
  const [metadataTypes, setMetadataTypes] = useState<MetadataType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<MetadataType | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('metadata_type')
        .select('*')
      
      if (error) throw error
      setMetadataTypes(data || [])
    } catch (err) {
      console.error('Error loading metadata types:', err)
      setError('Failed to load metadata types')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = async (metadataTypeId: string, newType: MetadataTypeType) => {
    if (!canEdit) return

    try {
      // If changing from DICT type, delete all dictionary values first
      const currentType = metadataTypes.find(mt => mt.id === metadataTypeId)?.type
      if (currentType === 'DICT') {
        const { error: deleteError } = await supabase
          .from('metadata_dict')
          .delete()
          .eq('metadata_type', metadataTypeId)
        
        if (deleteError) throw deleteError
      }

      // Update the metadata type
      const { error: updateError } = await supabase
        .from('metadata_type')
        .update({ type: newType })
        .eq('id', metadataTypeId)
      
      if (updateError) throw updateError

      // Update local state
      setMetadataTypes(prev => 
        prev.map(mt => 
          mt.id === metadataTypeId ? { ...mt, type: newType } : mt
        )
      )
    } catch (err) {
      console.error('Error updating metadata type:', err)
      setError('Failed to update metadata type')
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading metadata types...</div>
  }

  if (error) {
    return <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">{error}</div>
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metadataTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-mono text-sm">{type.id}</TableCell>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>
                  {canEdit ? (
                    <Select
                      value={type.type}
                      onValueChange={(value: MetadataTypeType) => handleTypeChange(type.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">TEXT</SelectItem>
                        <SelectItem value="DICT">DICT</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm">{type.type}</span>
                  )}
                </TableCell>
                <TableCell>
                  {type.type === 'DICT' && canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedType(type)}
                    >
                      Dict values
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DictValuesDialog
        open={selectedType !== null}
        onOpenChange={(open) => !open && setSelectedType(null)}
        metadataTypeId={selectedType?.id ?? ''}
        metadataTypeName={selectedType?.name ?? ''}
      />
    </>
  )
} 