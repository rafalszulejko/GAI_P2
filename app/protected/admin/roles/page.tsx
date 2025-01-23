import { guardRoute, getAllAppPermissions, getAllAppRoles } from "@/utils/permissions";
import { PermissionsList } from "./components/PermissionsList";

export default async function RolesPage() {
  await guardRoute('admin.role.view');
  const permissions = await getAllAppPermissions();
  const roles = await getAllAppRoles();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">User Roles</h1>
      <p className="text-muted-foreground">Manage user roles and their permissions in the application.</p>
      <PermissionsList permissions={permissions} roles={roles}/>
    </div>
  );
} 