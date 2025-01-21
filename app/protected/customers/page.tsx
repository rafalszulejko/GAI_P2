import { guardRoute } from "@/utils/permissions"

export default async function CustomersPage() {
  await guardRoute('customer.view')
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Customers</h1>
      <p className="text-muted-foreground">Manage your customer relationships here.</p>
    </div>
  )
} 