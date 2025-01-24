'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'

interface ProfileFormProps {
  userId: string
  initialEmail: string
  initialName: string
  initialLocation: string
}

export default function ProfileForm({ userId, initialEmail, initialName, initialLocation }: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [location, setLocation] = useState(initialLocation)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_profile')
        .update({ name, location })
        .eq('id', userId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Email</Label>
        <Input 
          type="email" 
          value={initialEmail} 
          disabled 
        />
      </div>

      <div className="space-y-1">
        <Label>Name</Label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-1">
        <Label>Location</Label>
        <Input 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Enter your location"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
} 