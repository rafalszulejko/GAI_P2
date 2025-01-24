import { createClient } from '@/utils/supabase/server'
import { decodeJWT } from '@/utils/utils'
import { Database } from '@/utils/supabase/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import ProfileForm from './components/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  
  const jwtToken = session?.access_token
  const decodedJWT = jwtToken ? decodeJWT(jwtToken) : null
  const userRole = decodedJWT?.user_role as Database['public']['Enums']['app_role'] | undefined

  // Fetch permissions for the user's role
  const { data: rolePermissions } = userRole ? await supabase
    .from('role_permissions')
    .select('permission')
    .eq('role', userRole) : { data: null }

  // Fetch user profile
  const { data: profileData } = user ? await supabase
    .from('user_profile')
    .select('name, location, email')
    .eq('id', user.id)
    .single() : { data: null }

  const lastLoginAt = decodedJWT?.exp ? new Date(decodedJWT.exp * 1000).toLocaleString() : 'Unknown'

  return (
    <div className="space-y-6">


      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>User ID</Label>
            <p className="text-sm font-mono bg-muted p-2 rounded-md">{user?.id}</p>
          </div>

          <ProfileForm 
            userId={user?.id ?? ''} 
            initialEmail={profileData?.email ?? user?.email ?? ''} 
            initialName={profileData?.name ?? ''} 
            initialLocation={profileData?.location ?? ''} 
          />

          <div className="space-y-1">
            <Label>Role</Label>
            <div>
              <Badge variant="secondary" className="text-xs">
                {userRole ?? 'No role assigned'}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Last Login</Label>
            <p className="text-sm text-muted-foreground">{lastLoginAt}</p>
          </div>

          <div className="space-y-1">
            <Label>Permissions</Label>
            <div className="flex flex-wrap gap-1">
              {rolePermissions?.map((p) => (
                <Badge key={p.permission} variant="outline" className="text-xs">
                  {p.permission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 