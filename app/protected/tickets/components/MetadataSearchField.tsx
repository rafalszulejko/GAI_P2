import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tables } from '@/utils/supabase/supabase'

type MetadataType = Tables<'metadata_type'>
type MetadataDict = Tables<'metadata_dict'>

interface MetadataSearchFieldProps {
  metadataTypeId: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function MetadataSearchField({ 
  metadataTypeId, 
  value, 
  onChange,
  disabled = false 
}: MetadataSearchFieldProps) {
  const [metadataType, setMetadataType] = useState<MetadataType | null>(null)
  const [dictValues, setDictValues] = useState<MetadataDict[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadMetadataInfo() {
      // Load metadata type info
      const { data: typeData } = await supabase
        .from('metadata_type')
        .select('*')
        .eq('id', metadataTypeId)
        .single()

      setMetadataType(typeData)

      // If it's a DICT type, load dictionary values
      if (typeData?.type === 'DICT') {
        const { data: dictData } = await supabase
          .from('metadata_dict')
          .select('*')
          .eq('metadata_type', metadataTypeId)
          .order('value')

        setDictValues(dictData || [])
      }
    }

    loadMetadataInfo()
  }, [metadataTypeId])

  if (!metadataType) return null

  return (
    <div className="space-y-2">
      <Label>{metadataType.name}</Label>
      {metadataType.type === 'DICT' ? (
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${metadataType.name.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {dictValues.map((dict) => (
              <SelectItem key={dict.value} value={dict.value}>
                {dict.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          placeholder={`Search by ${metadataType.name.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  )
} 