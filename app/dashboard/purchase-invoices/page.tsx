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
import { usePurchaseInvoices, Purchase } from "@/lib/hooks/purchase-invoices";
import { ConfirmDialog } from "@/components/saturasui/confirm-dialog";
import { Pagination } from "@/components/saturasui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
  waiting_for_payment: "bg-blue-100 text-blue-800",
  payment_partial: "bg-orange-100 text-orange-800",
};

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const {
    data: purchaseInvoicesData,
    loading,
    isValidating,
    deleteLoading,
    statusLoading,
    onQuery,
    onDelete,
    onUpdateStatus,
  } = usePurchaseInvoices();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<{
    id: string;
    action?: string;
  } | null>(null);

  const purchaseInvoices = purchaseInvoicesData?.records || [];
  const pageSummary = purchaseInvoicesData?.page_summary;

  const handleAddPurchaseOrder = () => {
    router.push("/dashboard/purchase-invoices/new");
  };

  const handleViewPurchaseInvoice = (id: string) => {
    router.push(`/dashboard/purchase-invoices/${id}`);
  };

  const handleEditPurchaseInvoice = (id: string) => {
    router.push(`/dashboard/purchase-invoices/${id}/edit`);
  };

  const handleDeletePurchaseInvoice = (id: string) => {
    setSelectedPurchase({ id });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPurchase) {
      await onDelete(selectedPurchase.id);
      setSelectedPurchase(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    onQuery({ status: value === "all" ? "" : value, page: 1 });
  };

  const handleStatusChange = (purchaseId: string, newStatus: string) => {
    setSelectedPurchase({ id: purchaseId, action: newStatus });
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (selectedPurchase?.id && selectedPurchase?.action) {
      await onUpdateStatus(selectedPurchase.id, selectedPurchase.action);
      setSelectedPurchase(null);
    }
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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">
              Purchase Invoices
            </h1>
            {isValidating && !loading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Manage your purchase invoices
          </p>
        </div>
        <Button
          onClick={handleAddPurchaseOrder}
          className="bg-primary hover:bg-primary/90"
          disabled={loading || isValidating}
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
              {loading || isValidating ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-7 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : purchaseInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-xs text-gray-500">
                      No purchase invoices found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                purchaseInvoices.map((po: Purchase) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium text-xs">
                      {po.invoice_number}
                    </TableCell>
                    <TableCell className="text-xs">
                      {po.supplier?.name || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {po.invoice_date ? formatDate(po.invoice_date) : "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {po.delivery_date ? formatDate(po.delivery_date) : "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatCurrency(po.grand_total)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={po.status}
                        onValueChange={(value) =>
                          handleStatusChange(po.id, value)
                        }
                        disabled={statusLoading}
                      >
                        <SelectTrigger
                          className={`w-[160px] h-7 text-xs ${
                            statusColors[po.status] ||
                            "bg-gray-100 text-gray-800"
                          } border-0`}
                        >
                          <SelectValue>
                            {po.status.replace(/_/g, " ").toUpperCase()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                          <SelectItem value="waiting_for_payment">
                            Waiting for Payment
                          </SelectItem>
                          <SelectItem value="payment_partial">
                            Payment Partial
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleViewPurchaseInvoice(po.id)}
                          disabled={loading || isValidating}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {po.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleEditPurchaseInvoice(po.id)}
                              disabled={loading || isValidating}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleDeletePurchaseInvoice(po.id)}
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
              Showing {purchaseInvoices.length} of {pageSummary.total} purchase
              invoices
            </p>
            <Pagination
              currentPage={pageSummary.page}
              totalPages={Math.ceil(pageSummary.total / pageSummary.size)}
              onPageChange={(page: number) => onQuery({ page })}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Purchase Invoice"
        description="Are you sure you want to delete this purchase invoice? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={deleteLoading}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        title="Change Status"
        description={
          selectedPurchase?.action
            ? `Are you sure you want to change the status to ${selectedPurchase.action
                .replace(/_/g, " ")
                .toUpperCase()}?`
            : "Are you sure you want to change the status?"
        }
        confirmText="Change Status"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        variant="default"
        loading={statusLoading}
      />
    </div>
  );
}
