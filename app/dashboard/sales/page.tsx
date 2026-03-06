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
import { useSales, Sale } from "@/lib/hooks/sales";
import { ConfirmDialog } from "@/components/saturasui/confirm-dialog";
import { Pagination } from "@/components/saturasui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-gray-100 text-gray-800",
};

export default function SalesPage() {
  const router = useRouter();
  const {
    data: salesData,
    loading,
    isValidating,
    deleteLoading,
    statusLoading,
    onQuery,
    onDelete,
    onUpdateStatus,
  } = useSales();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<{
    id: string;
    action?: string;
  } | null>(null);

  const sales = salesData?.records || [];
  const pageSummary = salesData?.page_summary;

  const handleAddSale = () => {
    router.push("/dashboard/sales/new");
  };

  const handleViewSale = (id: string) => {
    router.push(`/dashboard/sales/${id}`);
  };

  const handleEditSale = (id: string) => {
    router.push(`/dashboard/sales/${id}/edit`);
  };

  const handleDeleteSale = (id: string) => {
    setSelectedSale({ id });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSale) {
      await onDelete(selectedSale.id);
      setSelectedSale(null);
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

  const handleStatusChange = (saleId: string, newStatus: string) => {
    setSelectedSale({ id: saleId, action: newStatus });
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (selectedSale?.id && selectedSale?.action) {
      await onUpdateStatus(selectedSale.id, selectedSale.action);
      setSelectedSale(null);
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
          { label: "Sales" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Sales</h1>
            {isValidating && !loading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">Manage your sales</p>
        </div>
        <Button
          onClick={handleAddSale}
          className="bg-primary hover:bg-primary/90"
          disabled={loading || isValidating}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Sale
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder="Search by notes..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border border-[#F2F1ED] rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>Customer</TableHead>
                <TableHead>Sales Date</TableHead>
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
                        <Skeleton className="h-4 w-28" />
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
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-xs text-gray-500">No sales found</p>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale: Sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium text-xs">
                      {sale.customer?.name || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {sale.sales_date ? formatDate(sale.sales_date) : "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatCurrency(sale.grand_total)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sale.status}
                        onValueChange={(value) =>
                          handleStatusChange(sale.id, value)
                        }
                        disabled={statusLoading}
                      >
                        <SelectTrigger
                          className={`w-[140px] h-7 text-xs ${
                            statusColors[sale.status] ||
                            "bg-gray-100 text-gray-800"
                          } border-0`}
                        >
                          <SelectValue>
                            {sale.status.replace(/_/g, " ").toUpperCase()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleViewSale(sale.id)}
                          disabled={loading || isValidating}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {sale.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleEditSale(sale.id)}
                              disabled={loading || isValidating}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => handleDeleteSale(sale.id)}
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
              Showing {sales.length} of {pageSummary.total} sales
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
        title="Delete Sale"
        description="Are you sure you want to delete this sale? This action cannot be undone."
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
          selectedSale?.action
            ? `Are you sure you want to change the status to ${selectedSale.action
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
