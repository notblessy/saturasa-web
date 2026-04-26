"use client";

import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";
import { Button } from "@/components/saturasui/button";
import { Pagination } from "@/components/saturasui/pagination";
import { Loader2, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import { useInventoryValuation } from "@/lib/hooks/reports";

export default function InventoryValuationPage() {
  const { data, loading, onQuery } = useInventoryValuation();

  const records = data?.records || [];
  const formatCurrency = (val: number) =>
    Number(val).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

  const formatNumber = (val: number) =>
    Number(val).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Reports", href: "/dashboard/reports" },
          { label: "Inventory Valuation" },
        ]}
      />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Inventory Valuation
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Stock quantities and values across branches
        </p>
      </div>

      {data && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-gray-600">Grand Total:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(data.grand_total)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Valuation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent h-10">
                  <TableHead>Product</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Avg COGS</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      <p className="mt-2 text-xs text-gray-500">Loading...</p>
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-xs text-gray-500">No data found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r, i) => (
                    <TableRow key={`${r.product_id}-${r.branch_id}-${i}`} className="h-10">
                      <TableCell className="font-medium text-xs">
                        {r.product_name}
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.branch_name}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatNumber(r.total_stock)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatCurrency(r.avg_cogs)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-medium">
                        {formatCurrency(r.total_value)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data?.page_summary && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-gray-600">
                Showing {records.length} of {data.page_summary.total} items
              </p>
              <Pagination
                currentPage={data.page_summary.page}
                totalPages={Math.ceil(data.page_summary.total / data.page_summary.size)}
                onPageChange={(page) => onQuery({ page })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
