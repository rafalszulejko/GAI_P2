'use client'

import { Tables } from '@/utils/supabase/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type MetadataType = Tables<'metadata_type'>

interface MetadataFieldListProps {
  fields: MetadataType[]
  onRemoveField: (fieldId: string) => void
  canEdit: boolean
}

export function MetadataFieldList({ fields, onRemoveField, canEdit }: MetadataFieldListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {fields.map(field => (
        <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
          {field.name}
          {canEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onRemoveField(field.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      ))}
    </div>
  )
} 