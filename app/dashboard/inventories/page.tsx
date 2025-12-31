"use client";

import type React from "react";

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
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Search, Loader2, Package } from "lucide-react";
import { Button } from "@/components/saturasui/button";
import { useInventories } from "@/lib/hooks/inventories";

export default function InventoriesPage() {
  const { data: inventoriesData, loading, onQuery } = useInventories();

  const [searchTerm, setSearchTerm] = useState("");

  const inventories = inventoriesData?.records || [];

  // Handle search with debouncing
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

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav items={[{ label: "Inventories" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Inventories</h1>
          <p className="text-xs text-gray-600 mt-1">
            View and manage inventory levels across branches
          </p>
        </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="mt-2 text-xs text-gray-500">
                      Loading inventories...
                    </p>
                  </TableCell>
                </TableRow>
              ) : inventories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
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
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDate(inventory.last_updated)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
    </div>
  );
}
