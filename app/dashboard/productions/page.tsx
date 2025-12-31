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
import { Plus, Eye, Search, Loader2 } from "lucide-react";
import { useProductions, Production } from "@/lib/hooks/productions";
import { ConfirmDialog } from "@/components/saturasui/confirm-dialog";
import { Pagination } from "@/components/saturasui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/saturasui/label";
import { useBOMOptions } from "@/lib/hooks/productions";
import { useBranchOptions } from "@/lib/hooks/branches";
import { useAuth } from "@/lib/context/auth";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-gray-100 text-gray-800",
};

export default function ProductionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: productionsData,
    loading,
    isValidating,
    statusLoading,
    onQuery,
    onAdd,
    onUpdateStatus,
  } = useProductions();

  const { data: boms, loading: bomsLoading } = useBOMOptions();
  const { data: branches, loading: branchesLoading } = useBranchOptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<{
    id: string;
    action?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    branch_id: "",
    bom_id: "",
    quantity: "",
    notes: "",
  });

  const productions = productionsData?.records || [];
  const pageSummary = productionsData?.page_summary;

  const handleAddProduction = () => {
    setFormData({
      branch_id: "",
      bom_id: "",
      quantity: "",
      notes: "",
    });
    setIsSheetOpen(true);
  };

  const handleViewProduction = (id: string) => {
    router.push(`/dashboard/productions/${id}`);
  };

  const handleStatusChange = (productionId: string, newStatus: string) => {
    setSelectedProduction({ id: productionId, action: newStatus });
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (selectedProduction?.id && selectedProduction?.action) {
      await onUpdateStatus(selectedProduction.id, selectedProduction.action);
      setSelectedProduction(null);
      setStatusDialogOpen(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id) return;

    const result = await onAdd({
      company_id: user.company_id,
      branch_id: formData.branch_id,
      bom_id: formData.bom_id,
      quantity: parseFloat(formData.quantity),
      notes: formData.notes,
    });

    if (result?.success) {
      setIsSheetOpen(false);
      setFormData({
        branch_id: "",
        bom_id: "",
        quantity: "",
        notes: "",
      });
    }
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
          { label: "Productions" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Productions</h1>
            {isValidating && !loading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Manage your production orders
          </p>
        </div>
        <Button
          onClick={handleAddProduction}
          className="bg-primary hover:bg-primary/90"
          disabled={loading || isValidating}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Production
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder="Search by BOM name..."
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
                <TableHead>BOM Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Created Date</TableHead>
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-7 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : productions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-xs text-gray-500">
                      No productions found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                productions.map((production: Production) => (
                  <TableRow key={production.id}>
                    <TableCell className="font-medium text-xs">
                      {production.bom?.name || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {production.bom?.product?.name || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {production.branch?.name || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {production.quantity}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(production.created_at)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={production.status}
                        onValueChange={(value) =>
                          handleStatusChange(production.id, value)
                        }
                        disabled={
                          statusLoading || production.status !== "pending"
                        }
                      >
                        <SelectTrigger
                          className={`w-[140px] h-7 text-xs ${
                            statusColors[production.status] ||
                            "bg-gray-100 text-gray-800"
                          } border-0`}
                        >
                          <SelectValue>
                            {production.status.toUpperCase()}
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
                          onClick={() => handleViewProduction(production.id)}
                          disabled={loading || isValidating}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
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
              Showing {productions.length} of {pageSummary.total} productions
            </p>
            <Pagination
              currentPage={pageSummary.page}
              totalPages={Math.ceil(pageSummary.total / pageSummary.size)}
              onPageChange={(page: number) => onQuery({ page })}
            />
          </div>
        )}
      </div>

      {/* Create Production Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Production</SheetTitle>
            <SheetDescription>
              Create a new production order from a BOM
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="branch_id">Branch</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, branch_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bom_id">BOM</Label>
              <Select
                value={formData.bom_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, bom_id: value })
                }
                required
                disabled={bomsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={bomsLoading ? "Loading BOMs..." : "Select BOM"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {bomsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-xs text-gray-500">
                        Loading BOMs...
                      </span>
                    </div>
                  ) : boms.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500">
                      No BOMs available
                    </div>
                  ) : (
                    boms.map((bom: any) => (
                      <SelectItem key={bom.id} value={bom.id}>
                        {bom.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="Enter quantity"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Enter notes"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Production"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        title="Change Status"
        description={
          selectedProduction?.action
            ? `Are you sure you want to change the status to ${selectedProduction.action.toUpperCase()}? ${
                selectedProduction.action === "completed"
                  ? "This will process all stock transactions."
                  : ""
              }`
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
