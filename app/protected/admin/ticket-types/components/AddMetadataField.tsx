'use client'

import { useState } from 'react'
import { Tables } from '@/utils/supabase/supabase'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ChevronsUpDown } from 'lucide-react'

type MetadataType = Tables<'metadata_type'>

interface AddMetadataFieldProps {
  availableFields: MetadataType[]
  onAddField: (fieldId: string) => void
}

export function AddMetadataField({ availableFields, onAddField }: AddMetadataFieldProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (fieldId: string) => {
    onAddField(fieldId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          Add Field
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="right" align="start">
        <Command>
          <CommandInput placeholder="Search fields..." />
          <CommandList>
            <CommandEmpty>No fields found.</CommandEmpty>
            <CommandGroup>
              {(availableFields || []).map(field => (
                <CommandItem
                  key={field.id}
                  onSelect={() => handleSelect(field.id)}
                >
                  {field.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 