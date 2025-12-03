"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { ArrowLeft, Loader2 } from "lucide-react";
import { usePurchaseOrder } from "@/lib/hooks/purchase-orders";
import { Badge } from "@/components/saturasui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
  waiting_for_payment: "bg-blue-100 text-blue-800",
  payment_partial: "bg-orange-100 text-orange-800",
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseOrderId = params.id as string;
  const { purchase, isLoading } = usePurchaseOrder(purchaseOrderId);

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <BreadcrumbNav
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Purchase Orders", href: "/dashboard/purchase-orders" },
            { label: "Detail" },
          ]}
        />
        <div className="text-center py-12">
          <p className="text-gray-500">Purchase order not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-orders")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Orders", href: "/dashboard/purchase-orders" },
          { label: "Detail" },
        ]}
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">
            Purchase Order Detail
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-600 text-sm">
              Invoice: <span className="font-semibold text-gray-900">{purchase.invoice_number}</span>
            </p>
            <span className="text-gray-300">•</span>
            <p className="text-gray-600 text-sm">
              Created: <span className="font-medium">{formatDate(purchase.created_at)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              statusColors[purchase.status] || "bg-gray-100 text-gray-800"
            }
          >
            {purchase.status.replace(/_/g, " ").toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-base">Purchase Order Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow className="border-b">
                    <TableCell className="w-1/3 font-medium text-gray-700 bg-gray-50">
                      Invoice Number
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {purchase.invoice_number}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b">
                    <TableCell className="font-medium text-gray-700 bg-gray-50">
                      Status
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[purchase.status] || "bg-gray-100 text-gray-800"} text-xs`}
                      >
                        {purchase.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b">
                    <TableCell className="font-medium text-gray-700 bg-gray-50">
                      Supplier
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {purchase.supplier?.name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b">
                    <TableCell className="font-medium text-gray-700 bg-gray-50">
                      Branch
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {purchase.branch?.name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b">
                    <TableCell className="font-medium text-gray-700 bg-gray-50">
                      Invoice Date
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {formatDate(purchase.invoice_date)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-700 bg-gray-50">
                      Delivery Date
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {formatDate(purchase.delivery_date)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow className="border-b">
                    <TableCell className="w-1/3 font-medium text-gray-700 bg-gray-50">
                      Grand Total
                    </TableCell>
                    <TableCell className="font-bold text-lg text-gray-900">
                      {formatCurrency(purchase.grand_total)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b">
                    <TableCell className="font-medium text-gray-700 bg-gray-50">
                      Total Items
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {purchase.purchase_items?.length || 0}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-700 bg-gray-50">
                      Total Quantity
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {purchase.purchase_items?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Purchase Items</CardTitle>
            <span className="text-xs text-gray-500 font-medium">
              {purchase.purchase_items?.length || 0} item(s)
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                  <TableHead className="font-bold text-gray-900 py-3">Product</TableHead>
                  <TableHead className="font-bold text-gray-900 py-3">Description</TableHead>
                  <TableHead className="font-bold text-gray-900 py-3 text-center">Quantity</TableHead>
                  <TableHead className="font-bold text-gray-900 py-3 text-center">Unit</TableHead>
                  <TableHead className="font-bold text-gray-900 py-3 text-right">Price</TableHead>
                  <TableHead className="font-bold text-gray-900 py-3 text-right">Discount</TableHead>
                  <TableHead className="font-bold text-gray-900 py-3 text-right">Tax</TableHead>
                  <TableHead className="text-right font-bold text-gray-900 py-3">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.purchase_items && purchase.purchase_items.length > 0 ? (
                  purchase.purchase_items.map((item, index) => (
                    <TableRow 
                      key={item.id || index} 
                      className="hover:bg-gray-50 transition-colors border-b"
                    >
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {item.product?.name || "-"}
                          </span>
                          {item.product?.category && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {item.product.category.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm py-3">-</TableCell>
                      <TableCell className="font-semibold text-gray-900 text-center py-3">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                          {item.measurement_unit?.symbol || item.measurement_unit?.name || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-right py-3">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm text-right py-3">-</TableCell>
                      <TableCell className="text-gray-500 text-sm text-right py-3">-</TableCell>
                      <TableCell className="text-right font-bold text-gray-900 py-3">
                        {formatCurrency(item.sub_total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-gray-500 text-xs">No items found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {purchase.purchase_items && purchase.purchase_items.length > 0 && (
                <tfoot>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300">
                    <TableCell 
                      colSpan={7} 
                      className="text-right font-bold text-gray-900 py-4 pr-4"
                    >
                      Grand Total:
                    </TableCell>
                    <TableCell className="text-right font-bold text-xl text-gray-900 py-4">
                      {formatCurrency(purchase.grand_total)}
                    </TableCell>
                  </TableRow>
                </tfoot>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

