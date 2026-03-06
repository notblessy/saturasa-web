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
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Users,
  Briefcase,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import { useStaffs, Staff } from "@/lib/hooks/staffs";
import { usePositions, usePositionOptions, Position } from "@/lib/hooks/positions";
import { useBranchOptions } from "@/lib/hooks/branches";

export default function StaffPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Staff & Positions" },
        ]}
      />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Staff & Positions
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Manage staff members and their positions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StaffSection />
        </div>
        <div>
          <PositionsSection />
        </div>
      </div>
    </div>
  );
}

function StaffSection() {
  const {
    data: staffsData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  } = useStaffs();

  const { data: positionOptions } = usePositionOptions();
  const { data: branchOptions } = useBranchOptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    branch_id: "",
    position_id: "",
  });

  const staffs = staffsData?.records || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setFormData({ name: "", branch_id: "", position_id: "" });
    setIsSheetOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      branch_id: staff.branch_id,
      position_id: staff.position_id,
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await onEdit({ ...editingStaff, ...formData });
      } else {
        await onAdd(formData);
      }
      setIsSheetOpen(false);
      setFormData({ name: "", branch_id: "", position_id: "" });
    } catch {
      // Error handled in hook
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Staff Members
              </CardTitle>
              <CardDescription>Manage your team members</CardDescription>
            </div>
            <Button
              onClick={handleAdd}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search staff..."
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
                    <TableHead>Branch</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        <p className="mt-2 text-xs text-gray-500">
                          Loading staff...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : staffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-xs text-gray-500">
                          No staff members found
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    staffs.map((staff) => (
                      <TableRow key={staff.id} className="h-10">
                        <TableCell className="font-medium text-xs">
                          {staff.name}
                        </TableCell>
                        <TableCell className="text-xs">
                          {staff.branch?.name || "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {staff.position?.name || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleEdit(staff)}
                              disabled={editLoading}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleDelete(staff.id)}
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

            {staffsData && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Showing {staffs.length} of {staffsData.total} staff
                </p>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => onQuery({ page: staffsData.page - 1 })}
                    disabled={staffsData.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => onQuery({ page: staffsData.page + 1 })}
                    disabled={!staffsData.hasNext}
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
              {editingStaff ? "Edit Staff" : "Add New Staff"}
            </SheetTitle>
            <SheetDescription>
              {editingStaff
                ? "Update staff member information"
                : "Create a new staff member"}
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
                placeholder="Enter staff name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branch" className="text-xs font-medium">
                Branch *
              </Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, branch_id: value })
                }
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {branchOptions?.map((branch) => (
                    <SelectItem
                      key={branch.id}
                      value={branch.id}
                      className="text-xs"
                    >
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position" className="text-xs font-medium">
                Position *
              </Label>
              <Select
                value={formData.position_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, position_id: value })
                }
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {positionOptions?.map((pos) => (
                    <SelectItem
                      key={pos.id}
                      value={pos.id}
                      className="text-xs"
                    >
                      {pos.name}
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
                  {editingStaff ? "Updating..." : "Adding..."}
                </>
              ) : editingStaff ? (
                "Update Staff"
              ) : (
                "Add Staff"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

function PositionsSection() {
  const {
    data: positionsData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onEdit,
    onDelete,
  } = usePositions();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const positions = positionsData?.records || [];

  const handleAdd = () => {
    setEditingPosition(null);
    setFormData({ name: "" });
    setIsSheetOpen(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({ name: position.name });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPosition) {
      await onEdit({ ...editingPosition, name: formData.name });
    } else {
      await onAdd({ name: formData.name });
    }
    setIsSheetOpen(false);
    setFormData({ name: "" });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Positions
              </CardTitle>
              <CardDescription>Define staff positions</CardDescription>
            </div>
            <Button
              onClick={handleAdd}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <p className="mt-2 text-xs text-gray-500">Loading...</p>
              </div>
            ) : positions.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">
                No positions defined
              </p>
            ) : (
              positions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-900">
                    {position.name}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => handleEdit(position)}
                      disabled={editLoading}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => handleDelete(position.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingPosition ? "Edit Position" : "Add New Position"}
            </SheetTitle>
            <SheetDescription>
              {editingPosition
                ? "Update position name"
                : "Create a new position"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="pos-name" className="text-xs font-medium">
                Position Name *
              </Label>
              <Input
                id="pos-name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="e.g., Warehouse Manager"
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
                  {editingPosition ? "Updating..." : "Adding..."}
                </>
              ) : editingPosition ? (
                "Update Position"
              ) : (
                "Add Position"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
