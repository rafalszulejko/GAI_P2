import { guardRoute } from "@/utils/permissions";

export default async function OrganizationsPage() {
  await guardRoute('org.view')

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Organizations</h1>
      <p className="text-muted-foreground">Manage your business organizations here.</p>
    </div>
  );
} 