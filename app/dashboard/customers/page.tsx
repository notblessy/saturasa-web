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
import { useCustomers } from "@/lib/hooks/customers";

interface Customer {
  id: string;
  slug: string;
  company_id: string;
  name: string;
  contact_name: string;
  contact_number: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export default function CustomersPage() {
  const {
    data: customersData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    contact_number: "",
    email: "",
    address: "",
  });

  const customers = customersData?.records || [];

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      contact_name: "",
      contact_number: "",
      email: "",
      address: "",
    });
    setIsSheetOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      contact_name: customer.contact_name,
      contact_number: customer.contact_number,
      email: customer.email,
      address: customer.address,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await onEdit({ ...editingCustomer, ...formData });
      } else {
        await onAdd(formData);
      }
      setIsSheetOpen(false);
      setFormData({
        name: "",
        contact_name: "",
        contact_number: "",
        email: "",
        address: "",
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav items={[{ label: "Customers" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Customers</h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage your customer network
          </p>
        </div>
        <Button
          onClick={handleAddCustomer}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          Add Customer
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="h-10">
                  <TableCell className="font-medium text-xs">
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-xs">
                    {customer.contact_name}
                  </TableCell>
                  <TableCell className="text-xs">
                    {customer.contact_number}
                  </TableCell>
                  <TableCell className="text-xs">
                    {customer.email}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs">
                    {customer.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleEditCustomer(customer)}
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
                        onClick={() => handleDeleteCustomer(customer.id)}
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
        {customersData && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Showing {customers.length} of {customersData.total} customers
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: customersData.page - 1 })}
                disabled={customersData.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: customersData.page + 1 })}
                disabled={customers.length < customersData.size}
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
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </SheetTitle>
            <SheetDescription>
              {editingCustomer
                ? "Update customer information"
                : "Create a new customer entry"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Customer Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_name" className="text-xs font-medium">
                Contact Person *
              </Label>
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
              <Label htmlFor="contact_number" className="text-xs font-medium">
                Contact Number *
              </Label>
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
              <Label htmlFor="email" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-medium">
                Address
              </Label>
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
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
