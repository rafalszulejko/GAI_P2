import { guardRoute, getUserPermissions } from "@/utils/permissions";
import MetadataTypeTable from "./components/MetadataTypeTable";

export default async function MetadataTypesPage() {
  await guardRoute('admin.metadata.view');

  // Get permissions for conditional rendering
  const permissions = await getUserPermissions()
  const canEdit = permissions.includes('admin.metadata.edit')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Custom Fields</h1>
        <p className="text-muted-foreground">
          Manage reusable custom fields that can be used across different features.
        </p>
      </div>
      
      <MetadataTypeTable canEdit={canEdit} />
    </div>
  );
} 