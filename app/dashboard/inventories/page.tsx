"use client";

import { useState } from "react";
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
import { Search, Loader2, Package, Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/saturasui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/saturasui/badge";
import { useInventories } from "@/lib/hooks/inventories";
import { useStockAdjustment } from "@/lib/hooks/stock-adjustments";
import { useStockMovements } from "@/lib/hooks/stock-movements";
import { useBranchOptions } from "@/lib/hooks/branches";
import { Skeleton } from "@/components/ui/skeleton";
import { mutate } from "swr";
import { useAuth } from "@/lib/context/auth";

export default function InventoriesPage() {
  const { user } = useAuth();
  const {
    data: inventoriesData,
    loading,
    isValidating,
    onQuery,
  } = useInventories();

  const { loading: adjustLoading, onAdjust } = useStockAdjustment();
  const { data: branchOptions } = useBranchOptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [movementsOpen, setMovementsOpen] = useState(false);
  const [movementsTarget, setMovementsTarget] = useState<{
    productId: string;
    branchId: string;
    productName: string;
    branchName: string;
  } | null>(null);
  const [movementsPage, setMovementsPage] = useState(1);

  const { data: movementsData, isLoading: movementsLoading } =
    useStockMovements(
      movementsTarget?.productId || null,
      movementsTarget?.branchId || null,
      movementsPage,
      20
    );

  const handleViewMovements = (
    productId: string,
    branchId: string,
    productName: string,
    branchName: string
  ) => {
    setMovementsTarget({ productId, branchId, productName, branchName });
    setMovementsPage(1);
    setMovementsOpen(true);
  };

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    product_id: "",
    branch_id: "",
    type: "in",
    amount: "",
    reason: "",
  });

  const inventories = inventoriesData?.records || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAdjustFromRow = (productId: string, branchId: string) => {
    setAdjustForm({
      product_id: productId,
      branch_id: branchId,
      type: "in",
      amount: "",
      reason: "",
    });
    setIsSheetOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAdjust({
      branch_id: adjustForm.branch_id,
      product_id: adjustForm.product_id,
      type: adjustForm.type,
      amount: parseFloat(adjustForm.amount),
      reason: adjustForm.reason,
    });
    if (success) {
      setIsSheetOpen(false);
      // Revalidate inventories
      if (user?.company_id) {
        mutate(
          (key: string) =>
            typeof key === "string" && key.startsWith("v1/inventories"),
          undefined,
          { revalidate: true }
        );
      }
    }
  };

  // Get unique products from inventories for the dropdown
  const productOptions = inventories.reduce(
    (acc, inv) => {
      if (!acc.find((p) => p.id === inv.product_id)) {
        acc.push({ id: inv.product_id, name: inv.product_name });
      }
      return acc;
    },
    [] as { id: string; name: string }[]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav items={[{ label: "Inventories" }]} />

      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">
              Inventories
            </h1>
            {isValidating && !loading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            View and manage inventory levels across branches
          </p>
        </div>
        <Button
          onClick={() => {
            setAdjustForm({
              product_id: "",
              branch_id: "",
              type: "in",
              amount: "",
              reason: "",
            });
            setIsSheetOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Adjust Stock
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder="Search by product or branch..."
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
                <TableHead>Product</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead>Last Updated</TableHead>
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : inventories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        No inventories found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                inventories.map((inventory, index) => (
                  <TableRow
                    key={`${inventory.product_id}-${inventory.branch_id}-${index}`}
                    className="h-10"
                  >
                    <TableCell className="font-medium text-xs">
                      {inventory.product_name}
                    </TableCell>
                    <TableCell className="text-xs">
                      {inventory.branch_name}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {Number(inventory.total_stock).toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 10,
                      })}
                      {inventory.unit_symbol && (
                        <span className="ml-1 text-gray-500">
                          {inventory.unit_symbol}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDate(inventory.last_updated)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            handleViewMovements(
                              inventory.product_id,
                              inventory.branch_id,
                              inventory.product_name,
                              inventory.branch_name
                            )
                          }
                        >
                          <ArrowUpDown className="h-3 w-3 mr-1" />
                          Movements
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            handleAdjustFromRow(
                              inventory.product_id,
                              inventory.branch_id
                            )
                          }
                        >
                          Adjust
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {inventoriesData && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Showing {inventories.length} of {inventoriesData.total}{" "}
              inventories
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuery({ page: inventoriesData.page - 1 })}
                disabled={inventoriesData.page <= 1}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuery({ page: inventoriesData.page + 1 })}
                disabled={inventories.length < inventoriesData.size}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Adjustment Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Adjust Stock</SheetTitle>
            <SheetDescription>
              Manually adjust stock levels (opname)
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Product *</Label>
              <Select
                value={adjustForm.product_id}
                onValueChange={(value) =>
                  setAdjustForm({ ...adjustForm, product_id: value })
                }
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {productOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Branch *</Label>
              <Select
                value={adjustForm.branch_id}
                onValueChange={(value) =>
                  setAdjustForm({ ...adjustForm, branch_id: value })
                }
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {branchOptions?.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Type *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adjustForm.type === "in" ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex-1 ${
                    adjustForm.type === "in"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }`}
                  onClick={() =>
                    setAdjustForm({ ...adjustForm, type: "in" })
                  }
                >
                  Stock In
                </Button>
                <Button
                  type="button"
                  variant={adjustForm.type === "out" ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex-1 ${
                    adjustForm.type === "out"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                  onClick={() =>
                    setAdjustForm({ ...adjustForm, type: "out" })
                  }
                >
                  Stock Out
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={adjustForm.amount}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, amount: e.target.value })
                }
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reason</Label>
              <Input
                value={adjustForm.reason}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, reason: e.target.value })
                }
                placeholder="e.g., Physical count adjustment"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={adjustLoading}
            >
              {adjustLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Adjusting...
                </>
              ) : (
                "Submit Adjustment"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Stock Movements Dialog */}
      <Dialog open={movementsOpen} onOpenChange={setMovementsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Stock Movements — {movementsTarget?.productName}
            </DialogTitle>
            <p className="text-xs text-gray-500">
              Branch: {movementsTarget?.branchName}
            </p>
          </DialogHeader>
          <div className="border border-[#F2F1ED] rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent h-8">
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movementsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={`mv-skel-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !movementsData?.records ||
                  movementsData.records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      <p className="text-xs text-gray-500">
                        No movements found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  movementsData.records.map((m) => (
                    <TableRow key={m.id} className="h-8">
                      <TableCell className="text-xs text-gray-700">
                        {formatDate(m.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            m.type === "in"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {m.type === "in" ? "IN" : "OUT"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {m.type === "out" ? "-" : "+"}
                        {Number(m.amount).toLocaleString("id-ID", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 4,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {movementsData?.page_summary &&
            movementsData.page_summary.total > 20 && (
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-500">
                  Page {movementsData.page_summary.page} of{" "}
                  {Math.ceil(movementsData.page_summary.total / 20)}
                </p>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setMovementsPage((p) => Math.max(1, p - 1))}
                    disabled={movementsPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setMovementsPage((p) => p + 1)}
                    disabled={!movementsData.page_summary.hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
