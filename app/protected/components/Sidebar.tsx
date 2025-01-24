import Link from 'next/link'
import { Database } from '@/utils/supabase/supabase'
import { getUserPermissions } from '@/utils/permissions'

type Permission = Database['public']['Enums']['app_permission']

interface NavigationItem {
  name: string
  href: string
  permission?: Permission
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/protected' },
  { name: 'Tickets', href: '/protected/tickets', permission: 'ticket.view' },
  { name: 'Customers', href: '/protected/customers', permission: 'customer.view' },
  { name: 'Organizations', href: '/protected/organizations', permission: 'org.view' },
  { name: 'Admin', href: '/protected/admin', permission: 'admin.view' },
]

export async function Sidebar() {
  const permissions = await getUserPermissions()
  
  // Filter navigation items based on permissions
  const authorizedNavigation = navigation.filter(item => 
    !item.permission || permissions.includes(item.permission)
  )

  return (
    <div className="w-64 bg-card border-r">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-lg font-semibold">AutoCRM</span>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {authorizedNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
} 