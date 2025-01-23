import { createClient } from '@/utils/supabase/server'
import { decodeJWT } from './utils'
import { Database } from './supabase/supabase'
import { redirect } from 'next/navigation'

type Permission = Database['public']['Enums']['app_permission']

export async function getAllAppPermissions() {
  const supabase = await createClient();
  const { data: permissions, error } = await supabase.rpc('get_app_permissions');
  
  if (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
  
  return permissions as Permission[];
}

export async function getAllAppRoles() {
  const supabase = await createClient();
  const { data: roles, error } = await supabase.rpc('get_app_roles');
  
  if (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
  
  return roles as Database['public']['Enums']['app_role'][];
}


export async function getUserRole() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const jwtToken = session?.access_token
  const decodedJWT = jwtToken ? decodeJWT(jwtToken) : null
  return decodedJWT?.user_role as Database['public']['Enums']['app_role'] | undefined
}

export async function getUserPermissions() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return []

  const jwtToken = session.access_token
  const decodedJWT = jwtToken ? decodeJWT(jwtToken) : null
  const userRole = decodedJWT?.user_role as Database['public']['Enums']['app_role'] | undefined

  if (!userRole) return []

  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('permission')
    .eq('role', userRole)

  return rolePermissions?.map(p => p.permission) || []
}

export async function hasPermission(requiredPermission: Permission) {
  const permissions = await getUserPermissions()
  return permissions.includes(requiredPermission)
}

export async function guardRoute(requiredPermission?: Permission) {
  if (!requiredPermission) return

  const hasAccess = await hasPermission(requiredPermission)
  if (!hasAccess) {
    redirect('/protected/404')
  }
} 