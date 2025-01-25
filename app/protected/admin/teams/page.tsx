import { guardRoute, hasPermission } from "@/utils/permissions";
import { TeamMembersList } from "./components/TeamMembersList";
import { createClient } from "@/utils/supabase/server";

export default async function TeamsAdminPage() {
  await guardRoute('admin.teams.view');
  const canEditTeams = await hasPermission('admin.teams.edit');

  const supabase = await createClient();

  // Fetch all teams
  const { data: teams, error: teamsError } = await supabase
    .from('team')
    .select('*')
    .order('name');

  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
    throw teamsError;
  }

  // Get customer user IDs
  const { data: customerUsers } = await supabase
    .from('customer_user')
    .select('user_id');

  const formattedIds = `(${(customerUsers?.map(cu => cu.user_id) || []).join(',')})`;

  // Fetch all employee users (excluding customers)
  const { data: users, error: usersError } = await supabase
    .from('user_profile')
    .select('*')
    .not('id', 'in', formattedIds)
    .order('name');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw usersError;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Team Management</h1>
      <p className="text-muted-foreground">Manage teams and their members.</p>
      <TeamMembersList teams={teams} users={users} canEdit={canEditTeams} />
    </div>
  );
} 