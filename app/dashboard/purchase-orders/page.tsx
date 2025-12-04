"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Plus, Eye, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { usePurchaseOrders, Purchase } from "@/lib/hooks/purchase-orders";
import { Badge } from "@/components/saturasui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
  waiting_for_payment: "bg-blue-100 text-blue-800",
  payment_partial: "bg-orange-100 text-orange-800",
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const {
    data: purchaseOrdersData,
    loading,
    deleteLoading,
    onQuery,
    onDelete,
  } = usePurchaseOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const purchaseOrders = purchaseOrdersData?.records || [];
  const pageSummary = purchaseOrdersData?.page_summary;

  const handleAddPurchaseOrder = () => {
    router.push("/dashboard/purchase-orders/new");
  };

  const handleViewPurchaseOrder = (id: string) => {
    router.push(`/dashboard/purchase-orders/${id}`);
  };

  const handleEditPurchaseOrder = (id: string) => {
    router.push(`/dashboard/purchase-orders/${id}/edit`);
  };

  const handleDeletePurchaseOrder = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this purchase invoice?")
    ) {
      await onDelete(id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    onQuery({ status: value, page: 1 });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Invoices" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Purchase Invoices
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage your purchase invoices
          </p>
        </div>
        <Button
          onClick={handleAddPurchaseOrder}
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Purchase Invoice
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder="Search by invoice number..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="waiting_for_payment">
                Waiting for Payment
              </SelectItem>
              <SelectItem value="payment_partial">Payment Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border border-[#F2F1ED] rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>Invoice Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Grand Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="mt-2 text-xs text-gray-500">
                      Loading purchase invoices...
                    </p>
                  </TableCell>
                </TableRow>
              ) : purchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-xs text-gray-500">
                      No purchase invoices found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                purchaseOrders.map((po: Purchase) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium text-xs">
                      {po.invoice_number}
                    </TableCell>
                    <TableCell className="text-xs">{po.supplier?.name || "-"}</TableCell>
                    <TableCell className="text-xs">{po.invoice_date ? formatDate(po.invoice_date) : "-"}</TableCell>
                    <TableCell className="text-xs">{po.delivery_date ? formatDate(po.delivery_date) : "-"}</TableCell>
                    <TableCell className="text-xs">{formatCurrency(po.grand_total)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[po.status] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {po.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleViewPurchaseOrder(po.id)}
                          disabled={loading}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {po.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleEditPurchaseOrder(po.id)}
                              disabled={loading}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleDeletePurchaseOrder(po.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pageSummary && pageSummary.total > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Showing {purchaseOrders.length} of {pageSummary.total} purchase
              invoices
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: pageSummary.page - 1 })}
                disabled={pageSummary.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: pageSummary.page + 1 })}
                disabled={!pageSummary.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
