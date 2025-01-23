'use client'

import { useState, useEffect } from 'react'
import { Trash, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Tables } from '@/utils/supabase/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DictValue = Tables<'metadata_dict'>

interface DictValuesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metadataTypeId: string
  metadataTypeName: string
}

export function DictValuesDialog({ 
  open, 
  onOpenChange, 
  metadataTypeId,
  metadataTypeName 
}: DictValuesDialogProps) {
  const [values, setValues] = useState<DictValue[]>([])
  const [newValue, setNewValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      loadValues()
    }
  }, [open])

  const loadValues = async () => {
    try {
      const { data, error } = await supabase
        .from('metadata_dict')
        .select('*')
        .eq('metadata_type', metadataTypeId)
      
      if (error) throw error
      setValues(data || [])
    } catch (err) {
      console.error('Error loading dictionary values:', err)
      setError('Failed to load dictionary values')
    }
  }

  const handleDelete = async (value: string) => {
    try {
      const { error } = await supabase
        .from('metadata_dict')
        .delete()
        .eq('metadata_type', metadataTypeId)
        .eq('value', value)
      
      if (error) throw error
      
      setValues(prev => prev.filter(v => v.value !== value))
    } catch (err) {
      console.error('Error deleting dictionary value:', err)
      setError('Failed to delete dictionary value')
    }
  }

  const handleAdd = async () => {
    if (!newValue.trim()) return
    
    // Check for duplicates
    if (values.some(v => v.value === newValue)) {
      setError('This value already exists')
      return
    }

    try {
      const { error } = await supabase
        .from('metadata_dict')
        .insert([{ metadata_type: metadataTypeId, value: newValue }])
      
      if (error) throw error
      
      await loadValues()
      setNewValue('')
      setError(null)
    } catch (err) {
      console.error('Error adding dictionary value:', err)
      setError('Failed to add dictionary value')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dictionary Values - {metadataTypeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            {values.map((value) => (
              <div key={value.value} className="flex items-center justify-between group">
                <span className="text-sm">{value.value}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(value.value)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 