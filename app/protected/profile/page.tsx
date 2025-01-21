import { createClient } from '@/utils/supabase/server'
import { decodeJWT } from '@/utils/utils'
import { Database } from '@/utils/supabase/supabase'

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Your profile information
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">User Object</h4>
          <div className="rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">JWT Claims</h4>
          <div className="rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(decodedJWT, null, 2)}
            </pre>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Role Permissions</h4>
          <div className="rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(rolePermissions, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 