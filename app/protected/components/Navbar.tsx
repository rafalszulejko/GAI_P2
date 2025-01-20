import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { LogOut } from 'lucide-react'
import { redirect } from "next/navigation"

async function SignOut() {
  'use server'
  
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/sign-in')
}

export function Navbar() {
  return (
    <div className="h-16 border-b flex items-center justify-end px-6">
      <form action={SignOut}>
        <Button variant="ghost" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </form>
    </div>
  )
} 