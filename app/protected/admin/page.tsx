import { guardRoute } from "@/utils/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/utils/permissions";

export default async function AdminPage() {
  await guardRoute('admin.view');
  const canManageTicketTypes = await hasPermission('admin.tickettype.view');

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
      </div>
    </div>
  );
} 