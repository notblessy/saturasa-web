"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import { Label } from "@/components/saturasui/label";
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
import { Badge } from "@/components/saturasui/badge";
import { Pagination } from "@/components/saturasui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Eye,
  Loader2,
  ArrowRight,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useTransfers,
  TransferRequest,
  Transfer,
} from "@/lib/hooks/transfers";
import { useBranchOptions } from "@/lib/hooks/branches";
import { useProductOptions } from "@/lib/hooks/products";
import { NumericFormat } from "react-number-format";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function TransfersPage() {
  const {
    data: transfersData,
    loading,
    isValidating,
    onAdd,
    onQuery,
  } = useTransfers();

  const { data: branches, loading: branchesLoading } = useBranchOptions();
  const { data: products, loading: productsLoading } = useProductOptions();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
    null
  );

  const [formData, setFormData] = useState({
    source_branch_id: "",
    dest_branch_id: "",
    transfer_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [items, setItems] = useState<{ product_id: string; quantity: number }[]>(
    []
  );

  const transfers = transfersData?.records || [];
  const pageSummary = transfersData?.page_summary;

  const handleNewTransfer = () => {
    setFormData({
      source_branch_id: "",
      dest_branch_id: "",
      transfer_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setItems([]);
    setIsSheetOpen(true);
  };

  const handleViewTransfer = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setIsDetailOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: "product_id" | "quantity",
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.source_branch_id === formData.dest_branch_id) {
      return;
    }

    if (items.length === 0) {
      return;
    }

    const request: TransferRequest = {
      source_branch_id: formData.source_branch_id,
      dest_branch_id: formData.dest_branch_id,
      transfer_date: formData.transfer_date || null,
      notes: formData.notes,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };

    await onAdd(request);
    setIsSheetOpen(false);
    setFormData({
      source_branch_id: "",
      dest_branch_id: "",
      transfer_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setItems([]);
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || branchId;
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || productId;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Transfers" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Transfers</h1>
            {isValidating && !loading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Manage stock transfers between branches
          </p>
        </div>
        <Button
          onClick={handleNewTransfer}
          className="bg-primary hover:bg-primary/90"
          disabled={loading || isValidating}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Transfer
        </Button>
      </div>

      <div className="space-y-4">
        <div className="border border-[#F2F1ED] rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>Transfer Date</TableHead>
                <TableHead>Source Branch</TableHead>
                <TableHead></TableHead>
                <TableHead>Dest Branch</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Notes</TableHead>
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
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-xs text-gray-500">No transfers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer: Transfer) => (
                  <TableRow
                    key={transfer.id}
                    className="hover:bg-[#F7F7F4] cursor-pointer"
                    onClick={() => handleViewTransfer(transfer)}
                  >
                    <TableCell className="text-xs">
                      {transfer.transfer_date
                        ? formatDate(transfer.transfer_date)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {transfer.source_branch?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {transfer.dest_branch?.name || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {transfer.transfer_items?.length || 0}
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate">
                      {transfer.notes || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                        COMPLETED
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTransfer(transfer);
                          }}
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

        {pageSummary && pageSummary.total > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Showing {transfers.length} of {pageSummary.total} transfers
            </p>
            <Pagination
              currentPage={pageSummary.page}
              totalPages={Math.ceil(pageSummary.total / pageSummary.size)}
              onPageChange={(page: number) => onQuery({ page })}
            />
          </div>
        )}
      </div>

      {/* Create Transfer Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[480px] sm:w-[600px] bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Transfer</SheetTitle>
            <SheetDescription>
              Transfer stock between branches. Transfers execute immediately.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="source_branch" className="text-xs font-medium">
                Source Branch *
              </Label>
              <Select
                value={formData.source_branch_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, source_branch_id: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source branch" />
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
              <Label htmlFor="dest_branch" className="text-xs font-medium">
                Destination Branch *
              </Label>
              <Select
                value={formData.dest_branch_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, dest_branch_id: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select destination branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches
                    .filter((b) => b.id !== formData.source_branch_id)
                    .map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.source_branch_id &&
                formData.dest_branch_id &&
                formData.source_branch_id === formData.dest_branch_id && (
                  <p className="text-xs text-red-500">
                    Source and destination branches must be different
                  </p>
                )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transfer_date" className="text-xs font-medium">
                Transfer Date
              </Label>
              <Input
                id="transfer_date"
                type="date"
                value={formData.transfer_date}
                onChange={(e) =>
                  setFormData({ ...formData, transfer_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes about this transfer"
                rows={2}
              />
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Items *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              </div>

              {items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-md">
                  No items added. Click &quot;Add Item&quot; to begin.
                </p>
              )}

              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-end gap-2 p-3 border border-[#F2F1ED] rounded-md bg-[#FAFAF8]"
                >
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-gray-500">Product</Label>
                    <Select
                      value={item.product_id}
                      onValueChange={(value) =>
                        handleItemChange(index, "product_id", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28 space-y-1.5">
                    <Label className="text-xs text-gray-500">Quantity</Label>
                    <NumericFormat
                      value={item.quantity || ""}
                      onValueChange={(values) => {
                        handleItemChange(
                          index,
                          "quantity",
                          values.floatValue || 0
                        );
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      allowNegative={false}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={
                loading ||
                !formData.source_branch_id ||
                !formData.dest_branch_id ||
                formData.source_branch_id === formData.dest_branch_id ||
                items.length === 0 ||
                items.some((item) => !item.product_id || item.quantity <= 0)
              }
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : null}
              Create Transfer
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Transfer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>
              View transfer information and items
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Source Branch</p>
                  <p className="text-xs font-medium">
                    {selectedTransfer.source_branch?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destination Branch</p>
                  <p className="text-xs font-medium">
                    {selectedTransfer.dest_branch?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transfer Date</p>
                  <p className="text-xs font-medium">
                    {selectedTransfer.transfer_date
                      ? formatDate(selectedTransfer.transfer_date)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className="bg-green-100 text-green-800 border-0 text-xs mt-0.5">
                    COMPLETED
                  </Badge>
                </div>
              </div>

              {selectedTransfer.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-xs font-medium">
                    {selectedTransfer.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">Items</p>
                <div className="border border-[#F2F1ED] rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent h-8">
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs text-right">
                          Quantity
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransfer.transfer_items &&
                      selectedTransfer.transfer_items.length > 0 ? (
                        selectedTransfer.transfer_items.map((item) => (
                          <TableRow key={item.id} className="h-8">
                            <TableCell className="text-xs">
                              {item.product?.name || item.product_id}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {item.quantity.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="text-center py-4 text-xs text-gray-400"
                          >
                            No items
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Created: {formatDate(selectedTransfer.created_at)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
