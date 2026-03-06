"use client";

import { useState } from "react";
import { Button } from "@/components/saturasui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/saturasui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Plus, Edit, Trash2, Search, Loader2, UsersRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import { useCompanyUsers, CompanyUser } from "@/lib/hooks/users";
import { useRoleOptions } from "@/lib/hooks/roles";
import { useStaffs } from "@/lib/hooks/staffs";

export default function UsersPage() {
  const {
    data: usersData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  } = useCompanyUsers();

  const { data: roleOptions } = useRoleOptions();
  const { data: staffsData } = useStaffs();
  const staffOptions = staffsData?.records || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    staff_id: "",
  });

  const users = usersData?.records || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role_id: "", staff_id: "" });
    setIsSheetOpen(true);
  };

  const handleEdit = (user: CompanyUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role_id: user.role_id || "",
      staff_id: user.staff_id || "",
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await onEdit({
          id: editingUser.id,
          name: formData.name,
          email: formData.email,
          role_id: formData.role_id,
          staff_id: formData.staff_id || undefined,
        });
      } else {
        await onAdd(formData);
      }
      setIsSheetOpen(false);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Users" },
        ]}
      />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">Users</h1>
        <p className="text-xs text-gray-600 mt-1">
          Manage company users and their roles
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-1.5">
              <UsersRound className="h-3.5 w-3.5" />
              Company Users
            </CardTitle>
            <Button
              onClick={handleAdd}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search users..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        <p className="mt-2 text-xs text-gray-500">
                          Loading users...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-xs text-gray-500">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="h-10">
                        <TableCell className="font-medium text-xs">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-xs">{user.email}</TableCell>
                        <TableCell className="text-xs">
                          {user.role?.name ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                              {user.role.name}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {user.staff?.name || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleEdit(user)}
                              disabled={editLoading}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleDelete(user.id)}
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

            {usersData && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Showing {users.length} of {usersData.total} users
                </p>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => onQuery({ page: usersData.page - 1 })}
                    disabled={usersData.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => onQuery({ page: usersData.page + 1 })}
                    disabled={!usersData.hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </SheetTitle>
            <SheetDescription>
              {editingUser
                ? "Update user information"
                : "Create a new user in your company"}
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
                placeholder="Enter name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
                required
              />
            </div>
            {!editingUser && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter password"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-medium">
                Role *
              </Label>
              <Select
                value={formData.role_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, role_id: value })
                }
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {roleOptions?.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={role.id}
                      className="text-xs"
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff" className="text-xs font-medium">
                Link to Staff
              </Label>
              <Select
                value={formData.staff_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, staff_id: value })
                }
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select staff (optional)" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {staffOptions?.map((staff) => (
                    <SelectItem
                      key={staff.id}
                      value={staff.id}
                      className="text-xs"
                    >
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || editLoading}
            >
              {loading || editLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  {editingUser ? "Updating..." : "Adding..."}
                </>
              ) : editingUser ? (
                "Update User"
              ) : (
                "Add User"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
