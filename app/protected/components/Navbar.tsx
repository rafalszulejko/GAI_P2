import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { LogOut, User } from 'lucide-react'
import { redirect } from "next/navigation"
import Link from "next/link"
import { User as SupabaseUser } from '@supabase/supabase-js'

async function SignOut() {
  'use server'
  
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/sign-in')
}

export function Navbar({ user }: { user: SupabaseUser }) {
  return (
    <div className="h-16 border-b flex items-center justify-end px-6 gap-2">
      <Link href="/protected/profile">
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          Profile
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