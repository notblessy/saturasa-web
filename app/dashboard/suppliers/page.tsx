"use client";

import type React from "react";

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
import { Label } from "@/components/saturasui/label";
import { Textarea } from "@/components/ui/textarea";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useSuppliers } from "@/lib/hooks/suppliers";

interface Supplier {
  id: string;
  slug: string;
  company_id: string;
  name: string;
  contact_name: string;
  contact_number: string;
  address: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export default function SuppliersPage() {
  const {
    data: suppliersData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    contact_number: "",
    address: "",
  });

  const suppliers = suppliersData?.records || [];

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contact_name: "",
      contact_number: "",
      address: "",
    });
    setIsSheetOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name,
      contact_number: supplier.contact_number,
      address: supplier.address,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await onEdit({ ...editingSupplier, ...formData });
      } else {
        await onAdd(formData);
      }
      setIsSheetOpen(false);
      setFormData({
        name: "",
        contact_name: "",
        contact_number: "",
        address: "",
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav items={[{ label: "Suppliers" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Suppliers</h1>
          <p className="text-xs text-gray-600 mt-1">Manage your supplier network</p>
        </div>
        <Button
          onClick={handleAddSupplier}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          Add Supplier
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium text-xs">{supplier.name}</TableCell>
                  <TableCell className="text-xs">{supplier.contact_name}</TableCell>
                  <TableCell className="text-xs">{supplier.contact_number}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs">
                    {supplier.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleEditSupplier(supplier)}
                        disabled={editLoading}
                      >
                        {editLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Edit className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        disabled={deleteLoading}
                        className="text-red-600 hover:text-red-700"
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {suppliersData && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Showing {suppliers.length} of {suppliersData.total} suppliers
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: suppliersData.page - 1 })}
                disabled={suppliersData.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: suppliersData.page + 1 })}
                disabled={suppliers.length < suppliersData.size}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-white">
          <SheetHeader>
            <SheetTitle>
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </SheetTitle>
            <SheetDescription>
              {editingSupplier
                ? "Update supplier information"
                : "Create a new supplier entry"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">Supplier Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter supplier name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_name" className="text-xs font-medium">Contact Person *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) =>
                  setFormData({ ...formData, contact_name: e.target.value })
                }
                placeholder="Enter contact person name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_number" className="text-xs font-medium">Contact Number *</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                placeholder="Enter contact person number"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-medium">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter full address"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || editLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading || editLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : null}
              {editingSupplier ? "Update Supplier" : "Add Supplier"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
