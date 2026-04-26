"use client";

import { useState } from "react";
import { Button } from "@/components/saturasui/button";
import { Pagination } from "@/components/saturasui/pagination";
import { Input } from "@/components/saturasui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/saturasui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Shield,
  Key,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import { useRoles, useRole, Role } from "@/lib/hooks/roles";
import { usePermissionOptions } from "@/lib/hooks/permissions";

export default function RolesPage() {
  const {
    data: rolesData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
    onAddPermission,
    onRemovePermission,
  } = useRoles();

  const { data: allPermissions } = usePermissionOptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPermSheetOpen, setIsPermSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const { data: selectedRoleDetail } = useRole(selectedRoleId);

  const roles = rolesData?.records || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({ name: "", code: "" });
    setIsSheetOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, code: role.code });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await onEdit({ id: editingRole.id, ...formData });
      } else {
        await onAdd(formData);
      }
      setIsSheetOpen(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRoleId(role.id);
    setIsPermSheetOpen(true);
  };

  const isPermissionAssigned = (permId: string) => {
    return (
      selectedRoleDetail?.permissions?.some((p) => p.id === permId) ?? false
    );
  };

  const handleTogglePermission = async (permId: string) => {
    if (!selectedRoleId) return;
    if (isPermissionAssigned(permId)) {
      await onRemovePermission(selectedRoleId, permId);
    } else {
      await onAddPermission(selectedRoleId, permId);
    }
  };

  // Group permissions by resource
  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      const parts = perm.code.split(".");
      const resource = parts[0] || "other";
      if (!acc[resource]) acc[resource] = [];
      acc[resource].push(perm);
      return acc;
    },
    {} as Record<string, typeof allPermissions>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Roles" },
        ]}
      />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">Roles</h1>
        <p className="text-xs text-gray-600 mt-1">
          Manage roles and their permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Roles
            </CardTitle>
            <Button
              onClick={handleAdd}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent h-10">
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        <p className="mt-2 text-xs text-gray-500">
                          Loading roles...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-xs text-gray-500">No roles found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id} className="h-10">
                        <TableCell className="font-medium text-xs">
                          {role.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {role.code}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {role.permissions?.length || 0} permissions
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleManagePermissions(role)}
                            >
                              <Key className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleEdit(role)}
                              disabled={editLoading}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleDelete(role.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {rolesData && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Showing {roles.length} of {rolesData.total} roles
                </p>
                <Pagination
                  currentPage={rolesData.page}
                  totalPages={Math.ceil(rolesData.total / rolesData.size)}
                  onPageChange={(page) => onQuery({ page })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role CRUD Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingRole ? "Edit Role" : "Add New Role"}
            </SheetTitle>
            <SheetDescription>
              {editingRole
                ? "Update role information"
                : "Create a new role"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Warehouse Manager"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-medium">
                Code *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., warehouse_manager"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || editLoading}
            >
              {loading || editLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  {editingRole ? "Updating..." : "Adding..."}
                </>
              ) : editingRole ? (
                "Update Role"
              ) : (
                "Add Role"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Permission Management Sheet */}
      <Sheet open={isPermSheetOpen} onOpenChange={setIsPermSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Permissions</SheetTitle>
            <SheetDescription>
              Toggle permissions for{" "}
              {selectedRoleDetail?.name || "this role"}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource}>
                <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                  {resource.replace(/_/g, " ")}
                </h3>
                <div className="space-y-1">
                  {perms.map((perm) => {
                    const assigned = isPermissionAssigned(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`w-full flex items-center justify-between p-2 rounded text-xs transition-colors ${
                          assigned
                            ? "bg-green-50 hover:bg-green-100 text-green-800"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span>{perm.name}</span>
                        {assigned && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
