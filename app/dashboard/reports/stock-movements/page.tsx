"use client";

import { useState } from "react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Input } from "@/components/saturasui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";
import { Button } from "@/components/saturasui/button";
import { Label } from "@/components/saturasui/label";
import { Loader2, ArrowDown, ArrowUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import { useStockMovements } from "@/lib/hooks/reports";

export default function StockMovementsPage() {
  const { data, loading, onQuery } = useStockMovements();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const records = data?.records || [];

  const handleFilter = () => {
    onQuery({ date_from: dateFrom, date_to: dateTo, page: 1 });
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
          { label: "Stock Movements" },
        ]}
      />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Stock Movements
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Track all stock in/out movements
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40 text-xs"
              />
            </div>
            <Button
              onClick={handleFilter}
              className="bg-primary hover:bg-primary/90 text-xs"
            >
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent h-10">
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
                      <p className="text-xs text-gray-500">
                        No movements found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r) => (
                    <TableRow key={r.id} className="h-10">
                      <TableCell className="text-xs text-gray-500">
                        {formatDate(r.created_at)}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {r.product_name}
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.branch_name}
                      </TableCell>
                      <TableCell>
                        {r.type === "in" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                            <ArrowDown className="h-3 w-3" />
                            In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                            <ArrowUp className="h-3 w-3" />
                            Out
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatNumber(r.amount)}
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
                Showing {records.length} of {data.page_summary.total} movements
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onQuery({ page: data.page_summary.page - 1 })
                  }
                  disabled={data.page_summary.page <= 1}
                  className="text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onQuery({ page: data.page_summary.page + 1 })
                  }
                  disabled={!data.page_summary.hasNext}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
