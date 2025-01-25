import { guardRoute } from "@/utils/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/utils/permissions";

export default async function AdminPage() {
  await guardRoute('admin.view');
  const canManageTicketTypes = await hasPermission('admin.tickettype.view');
  const canManageMetadataTypes = await hasPermission('admin.metadata.view');
  const canManageRoles = await hasPermission('admin.role.view');
  const canManageUsers = await hasPermission('admin.users.view');
  const canManageTeams = await hasPermission('admin.teams.view');

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground">System administration and settings.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {canManageTicketTypes && (
          <Card>
            <CardHeader>
              <CardTitle>Ticket Types</CardTitle>
              <CardDescription>
                Manage ticket types and their custom fields to organize your support workflow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/protected/admin/ticket-types">Manage Ticket Types</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {canManageMetadataTypes && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Manage reusable custom fields that can be used across different features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/protected/admin/metadata-types">Manage Custom Fields</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {canManageRoles && (
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Manage user roles and assign detailed application permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/protected/admin/roles">Manage Roles</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {canManageUsers && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage system users, their profiles and access settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/protected/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {canManageTeams && (
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage teams and their members to organize your support structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/protected/admin/teams">Manage Teams</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 