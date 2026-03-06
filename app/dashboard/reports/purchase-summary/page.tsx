"use client";

import { useState } from "react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Input } from "@/components/saturasui/input";
import { Button } from "@/components/saturasui/button";
import { Label } from "@/components/saturasui/label";
import { Loader2, ShoppingCart, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/saturasui/card";
import { usePurchaseSummary } from "@/lib/hooks/reports";

export default function PurchaseSummaryPage() {
  const { data, loading, onQuery } = usePurchaseSummary();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleFilter = () => {
    onQuery({ date_from: dateFrom, date_to: dateTo });
  };

  const formatCurrency = (val: number) =>
    Number(val).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    approved: "bg-blue-50 text-blue-700",
    rejected: "bg-red-50 text-red-700",
    canceled: "bg-gray-50 text-gray-700",
    waiting_for_payment: "bg-orange-50 text-orange-700",
    payment_partial: "bg-purple-50 text-purple-700",
    paid: "bg-green-50 text-green-700",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Reports", href: "/dashboard/reports" },
          { label: "Purchase Summary" },
        ]}
      />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Purchase Summary
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Purchase analytics by status
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

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          <p className="mt-2 text-xs text-gray-500">Loading...</p>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">
                  Total Purchases
                </CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  {data.total_purchases}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">
                  Total Amount
                </CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {formatCurrency(data.total_amount)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">By Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.by_status && data.by_status.length > 0 ? (
                  data.by_status.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between p-3 rounded-md bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            statusColors[item.status] ||
                            "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.count} invoice{item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-medium">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No purchase data found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
