import Link from 'next/link'
import { Database } from '@/utils/supabase/supabase'
import { getUserPermissions } from '@/utils/permissions'

type Permission = Database['public']['Enums']['app_permission']

interface NavigationItem {
  name: string
  href: string
  permission?: Permission
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/protected' },
  { name: 'Tickets', href: '/protected/tickets', permission: 'ticket.view' },
  { name: 'Customers', href: '/protected/customers', permission: 'customer.view' },
  { name: 'Organizations', href: '/protected/organizations', permission: 'org.view' },
  { 
    name: 'Admin', 
    href: '/protected/admin', 
    permission: 'admin.view',
    children: [
      { name: 'Ticket Types', href: '/protected/admin/ticket-types', permission: 'admin.tickettype.view' },
      { name: 'Custom Fields', href: '/protected/admin/metadata-types', permission: 'admin.metadata.view' },
      { name: 'Roles', href: '/protected/admin/roles', permission: 'admin.role.view' },
      { name: 'Users', href: '/protected/admin/users', permission: 'admin.users.view' },
      { name: 'Teams', href: '/protected/admin/teams', permission: 'admin.teams.view' },
    ]
  },
]

export async function Sidebar() {
  const permissions = await getUserPermissions()
  
  const authorizedNavigation = navigation.filter(item => {
    // Check parent permission
    if (!item.permission || permissions.includes(item.permission)) {
      // If it has children, filter them too
      if (item.children) {
        item.children = item.children.filter(child => 
          !child.permission || permissions.includes(child.permission)
        )
      }
      return true
    }
    return false
  })

  return (
    <div className="w-64 bg-card border-r">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-lg font-semibold">AutoCRM</span>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {authorizedNavigation.map(item => (
          <div key={item.name}>
            <Link
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              {item.name}
            </Link>
            {item.children && (
              <div className="ml-4">
                {item.children.map(child => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
} 