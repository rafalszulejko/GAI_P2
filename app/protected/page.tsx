import { getUserRole } from "@/utils/permissions";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const userRole = await getUserRole();
  const supabase = await createClient();

  let ticketStats = {
    PENDING: 0,
    OPEN: 0,
    NEW: 0
  };

  let userProfile = {
    name: null,
    location: null
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const userId = user.id;

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('user_profile')
      .select('name, location')
      .eq('id', userId)
      .single();

    if (profileData) {
      userProfile = profileData;
    }

    if (userRole === 'customer') {
      // Fetch ticket counts for each state
      const { count: pendingCount } = await supabase
        .from('ticket')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('STATE', 'PENDING') as PostgrestSingleResponse<{ count: number }>;

      const { count: openCount } = await supabase
        .from('ticket')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('STATE', 'OPEN') as PostgrestSingleResponse<{ count: number }>;

      const { count: newCount } = await supabase
        .from('ticket')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('STATE', 'NEW') as PostgrestSingleResponse<{ count: number }>;

      ticketStats = {
        PENDING: pendingCount || 0,
        OPEN: openCount || 0,
        NEW: newCount || 0
      };
    } else if (userRole === 'employee') {
      // Fetch ticket counts for assigned tickets
      const { count: openCount } = await supabase
        .from('ticket')
        .select('*', { count: 'exact', head: true })
        .eq('assignee', userId)
        .eq('STATE', 'OPEN') as PostgrestSingleResponse<{ count: number }>;

      const { count: pendingCount } = await supabase
        .from('ticket')
        .select('*', { count: 'exact', head: true })
        .eq('assignee', userId)
        .eq('STATE', 'PENDING') as PostgrestSingleResponse<{ count: number }>;

      ticketStats = {
        ...ticketStats,
        PENDING: pendingCount || 0,
        OPEN: openCount || 0
      };
    }
  }

  const hasIncompleteProfile = !userProfile.name || !userProfile.location;
  const welcomeMessage = userProfile.name ? `Welcome back, ${userProfile.name}` : "Welcome";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
      
      {userRole === 'customer' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.PENDING}</div>
              <p className="text-xs text-muted-foreground">Tickets waiting for your response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.OPEN}</div>
              <p className="text-xs text-muted-foreground">Tickets being processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.NEW}</div>
              <p className="text-xs text-muted-foreground">Tickets waiting to be processed</p>
            </CardContent>
          </Card>
        </div>
      ) : userRole === 'employee' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Assigned to You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.OPEN}</div>
              <p className="text-xs text-muted-foreground">Tickets waiting for your action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.PENDING}</div>
              <p className="text-xs text-muted-foreground">Tickets waiting for customer response</p>
            </CardContent>
          </Card>
        </div>
      ) : userRole === 'admin' ? (
        <p className="text-muted-foreground">
          This message was written by the admin. Admins are the best!!!
        </p>
      ) : (
        <p className="text-muted-foreground">
          You seem to have no role assigned. Please message me to assign you a role!
        </p>
      )}

      {hasIncompleteProfile && (
        <Alert>
          <AlertDescription>
            At least one information in your profile is missing. Head to <Link href="/protected/profile" className="underline font-medium">your profile page</Link> to fill it.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
