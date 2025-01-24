import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tables } from '@/utils/supabase/supabase'

type UserProfile = Tables<'user_profile'>

interface UserSearchFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  users: UserProfile[]
  disabled?: boolean
}

export default function UserSearchField({
  label,
  value,
  onChange,
  users,
  disabled = false
}: UserSearchFieldProps) {
  const selectedUser = users.find(u => u.id === value)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || ''}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`}>
            {selectedUser && (
              <div className="flex flex-col items-start w-full">
                <span className="font-medium">{selectedUser.name}</span>
                <span className="text-xs text-muted-foreground">{selectedUser.email}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex flex-col items-start w-full">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 