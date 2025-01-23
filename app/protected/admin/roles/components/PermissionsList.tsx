'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Database } from "@/utils/supabase/supabase";
import { createClient } from "@/utils/supabase/client";

type Permission = Database['public']['Enums']['app_permission'];
type Role = Database['public']['Enums']['app_role'];

interface PermissionsListProps {
  permissions: Permission[];
  roles: Role[];
}

export function PermissionsList({ permissions, roles }: PermissionsListProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0]);
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [selectedUnassigned, setSelectedUnassigned] = useState<Permission[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<Permission[]>([]);
  const supabase = createClient();

  // Load assigned permissions when role changes
  const loadAssignedPermissions = async (role: Role) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role', role);

      if (error) throw error;

      setAssignedPermissions(data.map(rp => rp.permission));
    } catch (err) {
      console.error('Error loading role permissions:', err);
    }
  };

  // Handle role change
  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setSelectedUnassigned([]);
    setSelectedAssigned([]);
    loadAssignedPermissions(role);
  };

  // Handle assigning permissions
  const handleAssign = async () => {
    if (selectedUnassigned.length === 0) return;

    try {
      const { error } = await supabase
        .from('role_permissions')
        .insert(
          selectedUnassigned.map(permission => ({
            role: selectedRole,
            permission
          }))
        );

      if (error) throw error;

      // Update local state
      setAssignedPermissions(prev => [...prev, ...selectedUnassigned]);
      setSelectedUnassigned([]);
    } catch (err) {
      console.error('Error assigning permissions:', err);
    }
  };

  // Handle unassigning permissions
  const handleUnassign = async () => {
    if (selectedAssigned.length === 0) return;

    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', selectedRole)
        .in('permission', selectedAssigned);

      if (error) throw error;

      // Update local state
      setAssignedPermissions(prev => 
        prev.filter(p => !selectedAssigned.includes(p))
      );
      setSelectedAssigned([]);
    } catch (err) {
      console.error('Error unassigning permissions:', err);
    }
  };

  // Toggle selection in unassigned list
  const toggleUnassigned = (permission: Permission) => {
    setSelectedUnassigned(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  // Toggle selection in assigned list
  const toggleAssigned = (permission: Permission) => {
    setSelectedAssigned(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  // Get unassigned permissions
  const unassignedPermissions = permissions
    .filter(p => !assignedPermissions.includes(p))
    .sort((a, b) => a.localeCompare(b));

  // Sort assigned permissions
  const sortedAssignedPermissions = [...assignedPermissions].sort((a, b) => a.localeCompare(b));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedRole}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map(role => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
          {/* Unassigned permissions */}
          <div className="border rounded-lg p-2 space-y-1">
            {unassignedPermissions.map(permission => (
              <div
                key={permission}
                className={`p-2 rounded cursor-pointer ${
                  selectedUnassigned.includes(permission)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
                onClick={() => toggleUnassigned(permission)}
              >
                {permission}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleAssign}
              disabled={selectedUnassigned.length === 0}
            >
              →
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleUnassign}
              disabled={selectedAssigned.length === 0}
            >
              ←
            </Button>
          </div>

          {/* Assigned permissions */}
          <div className="border rounded-lg p-2 space-y-1">
            {sortedAssignedPermissions.map(permission => (
              <div
                key={permission}
                className={`p-2 rounded cursor-pointer ${
                  selectedAssigned.includes(permission)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
                onClick={() => toggleAssigned(permission)}
              >
                {permission}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 