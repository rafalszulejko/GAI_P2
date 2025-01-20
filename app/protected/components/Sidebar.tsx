import Link from 'next/link'

const navigation = [
  { name: 'Dashboard', href: '/protected' },
  { name: 'Tickets', href: '/protected/tickets' },
  { name: 'Customers', href: '/protected/customers' },
  { name: 'Organizations', href: '/protected/organizations' },
  { name: 'Admin', href: '/protected/admin' },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-lg font-semibold">CRM System</span>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {navigation.map((item) => (
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