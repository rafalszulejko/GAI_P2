import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { LogOut, User } from 'lucide-react'
import { redirect } from "next/navigation"
import Link from "next/link"
import { User as SupabaseUser } from '@supabase/supabase-js'
import { ThemeSwitcher } from "@/components/theme-switcher"

async function SignOut() {
  'use server'
  
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/sign-in')
}

export async function Navbar({ user }: { user: SupabaseUser }) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profile')
    .select('name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.name || "Profile"

  return (
    <div className="h-16 border-b flex items-center justify-end px-6 gap-2">
      <ThemeSwitcher />
      <Link href="/protected/profile">
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          {displayName}
        </Button>
      </Link>
      <form action={SignOut}>
        <Button variant="ghost" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </form>
    </div>
  )
} 