import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { LogOut } from 'lucide-react'

async function SignOut() {
  'use server'
  
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/sign-in')
}

const navigation = [
  { name: 'Dashboard', href: '/protected' },
  { name: 'Tickets', href: '/protected/tickets' },
  { name: 'Customers', href: '/protected/customers' },
  { name: 'Organizations', href: '/protected/organizations' },
  { name: 'Admin', href: '/protected/admin' },
]

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="h-16 border-b flex items-center justify-end px-6">
          <form action={SignOut}>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 