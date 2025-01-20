import { createClient } from '@/utils/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Your profile information
        </p>
      </div>
      <div className="rounded-md bg-muted p-4">
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  )
} 