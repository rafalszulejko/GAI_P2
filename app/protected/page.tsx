import { getUserRole } from "@/utils/permissions";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export default async function DashboardPage() {
  const userRole = await getUserRole();
  const supabase = await createClient();

  let ticketStats = {
    PENDING: 0,
    OPEN: 0,
    NEW: 0
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const userId = user.id;

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

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {userRole === 'customer' ? (
        <p className="text-muted-foreground">
          You have <span className="text-lg font-medium text-primary">{ticketStats.PENDING}</span> pending tickets to take action. 
          There are <span className="text-lg font-medium text-primary">{ticketStats.OPEN}</span> tickets currently processed by our agents and <span className="text-lg font-medium text-primary">{ticketStats.NEW}</span> are waiting.
        </p>
      ) : userRole === 'employee' ? (
        <p className="text-muted-foreground">
          You have currently <span className="text-lg font-medium text-primary">{ticketStats.OPEN}</span> tickets assigned to you, waiting for your action, while <span className="text-lg font-medium text-primary">{ticketStats.PENDING}</span> are waiting for the customer response.
        </p>
      ) : userRole === 'admin' ? (
        <p className="text-muted-foreground">
          This message was written by the admin. Admins are the best!!!
        </p>
      ) : (
        <p className="text-muted-foreground">
          You seem to have no role assigned. Please message me to assign you a role!
        </p>
      )}
    </div>
  )
}
