import { guardRoute } from "@/utils/permissions";
import { createClient } from "@/utils/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function UsersPage() {
  await guardRoute('admin.users.view');
  
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from('user_profile')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to load users');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">User Management</h1>
      <p className="text-muted-foreground">Manage system users, their profiles and access settings.</p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || '-'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.location || '-'}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 