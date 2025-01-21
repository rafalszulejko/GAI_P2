import { guardRoute } from "@/utils/permissions";

export default async function AdminPage() {
  await guardRoute('admin.view')

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground">System administration and settings.</p>
    </div>
  )
} 