"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/saturasui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { ArrowLeft, Loader2 } from "lucide-react";
import { usePurchaseInvoice } from "@/lib/hooks/purchase-invoices";
import { Badge } from "@/components/saturasui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
  waiting_for_payment: "bg-blue-100 text-blue-800",
  payment_partial: "bg-orange-100 text-orange-800",
};

export default function PurchaseInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseInvoiceId = params.id as string;
  const { purchase, isLoading } = usePurchaseInvoice(purchaseInvoiceId);

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
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <BreadcrumbNav
          items={[
            { label: "Dashboard", href: "/dashboard" },
            {
              label: "Purchase Invoices",
              href: "/dashboard/purchase-invoices",
            },
            { label: "Detail" },
          ]}
        />
        <div className="text-center py-12">
          <p className="text-xs text-gray-500">Purchase invoice not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-invoices")}
            className="mt-4"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Purchase Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Invoices", href: "/dashboard/purchase-invoices" },
          { label: "Detail" },
        ]}
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Purchase Invoice Detail
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600 text-xs">
              Invoice:{" "}
              <span className="font-semibold text-gray-900">
                {purchase.invoice_number}
              </span>
            </p>
            <span className="text-gray-300">•</span>
            <p className="text-gray-600 text-xs">
              Created:{" "}
              <span className="font-medium">
                {formatDate(purchase.created_at)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            className={
              statusColors[purchase.status] || "bg-gray-100 text-gray-800"
            }
          >
            {purchase.status.replace(/_/g, " ").toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-invoices")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-[#E8E8E3] border-b border-[#D4D4CF] p-3">
          <CardTitle className="text-xs font-semibold">
            Purchase Invoice Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableBody>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="w-1/3 font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Invoice Number
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 text-xs py-2 px-3">
                    {purchase.invoice_number}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Status
                  </TableCell>
                  <TableCell className="text-xs py-2 px-3">
                    <Badge
                      className={`${
                        statusColors[purchase.status] ||
                        "bg-gray-100 text-gray-800"
                      } text-xs`}
                    >
                      {purchase.status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Supplier
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {purchase.supplier?.name || "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Branch
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {purchase.branch?.name || "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Invoice Date
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {purchase.invoice_date
                      ? formatDate(purchase.invoice_date)
                      : "-"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Delivery Date
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {purchase.delivery_date
                      ? formatDate(purchase.delivery_date)
                      : "-"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-[#E8E8E3] border-b border-[#D4D4CF] p-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs font-semibold">
              Purchase Items
            </CardTitle>
            <span className="text-xs text-gray-500 font-medium">
              {purchase.purchase_items?.length || 0} item(s)
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent h-10">
                  <TableHead className="font-semibold text-xs py-2 px-3">
                    Product
                  </TableHead>
                  <TableHead className="font-semibold text-xs py-2 px-3">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-center py-2 px-3">
                    Quantity
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-center py-2 px-3">
                    Unit
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-right py-2 px-3">
                    Price
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-right py-2 px-3">
                    Discount
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-right py-2 px-3">
                    Tax
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs py-2 px-3">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.purchase_items &&
                purchase.purchase_items.length > 0 ? (
                  purchase.purchase_items.map((item, index) => (
                    <TableRow
                      key={item.id || index}
                      className="hover:bg-[#F7F7F4] transition-colors border-b border-[#F2F1ED]"
                    >
                      <TableCell className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-900">
                            {item.product?.name || "-"}
                          </span>
                          {item.product?.category && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {item.product.category.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs py-2 px-3">
                        -
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-center text-xs py-2 px-3">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center py-2 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                          {item.measurement_unit?.symbol ||
                            item.measurement_unit?.name ||
                            "-"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-right text-xs py-2 px-3">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs text-right py-2 px-3">
                        -
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs text-right py-2 px-3">
                        -
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900 text-xs py-2 px-3">
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
              {purchase.purchase_items &&
                purchase.purchase_items.length > 0 && (
                  <tfoot>
                    <TableRow className="bg-[#F7F7F4] border-t-2 border-[#F2F1ED] h-10">
                      <TableCell
                        colSpan={7}
                        className="text-right font-bold text-gray-900  text-xs"
                      >
                        Grand Total:
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-gray-900">
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
