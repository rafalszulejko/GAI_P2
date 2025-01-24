import { guardRoute, getUserPermissions } from "@/utils/permissions"
import { CustomersList } from "./components/CustomersList"

export default async function CustomersPage() {
  await guardRoute('customer.view')
  
  const permissions = await getUserPermissions()
  const canViewDetails = permissions.includes('customer.details.view')
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Customers</h1>
      <p className="text-muted-foreground">Manage your customer relationships here.</p>
      <CustomersList canViewDetails={canViewDetails} />
    </div>
  )
} 