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
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useSale } from "@/lib/hooks/sales";
import { Badge } from "@/components/saturasui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-gray-100 text-gray-800",
};

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const saleId = params.id as string;
  const { sale, isLoading, statusLoading, onUpdateStatus } = useSale(saleId);

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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <BreadcrumbNav
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sales", href: "/dashboard/sales" },
            { label: "Detail" },
          ]}
        />
        <div className="text-center py-12">
          <p className="text-xs text-gray-500">Sale not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/sales")}
            className="mt-4"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Sales
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
          { label: "Sales", href: "/dashboard/sales" },
          { label: "Detail" },
        ]}
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sales Detail</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600 text-xs">
              Customer:{" "}
              <span className="font-semibold text-gray-900">
                {sale.customer?.name || "-"}
              </span>
            </p>
            <span className="text-gray-300">|</span>
            <p className="text-gray-600 text-xs">
              Created:{" "}
              <span className="font-medium">
                {formatDate(sale.created_at)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            className={
              statusColors[sale.status] || "bg-gray-100 text-gray-800"
            }
          >
            {sale.status.replace(/_/g, " ").toUpperCase()}
          </Badge>
          {sale.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={() => onUpdateStatus("completed")}
                disabled={statusLoading}
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                {statusLoading ? "Processing..." : "Complete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onUpdateStatus("canceled")}
                disabled={statusLoading}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                {statusLoading ? "Processing..." : "Cancel"}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/sales")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-[#E8E8E3] border-b border-[#D4D4CF] p-3">
          <CardTitle className="text-xs font-semibold">
            Sales Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableBody>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="w-1/3 font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Customer
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 text-xs py-2 px-3">
                    {sale.customer?.name || "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Branch
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {sale.branch?.name || "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Sales Date
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {sale.sales_date ? formatDate(sale.sales_date) : "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Status
                  </TableCell>
                  <TableCell className="text-xs py-2 px-3">
                    <Badge
                      className={`${
                        statusColors[sale.status] ||
                        "bg-gray-100 text-gray-800"
                      } text-xs`}
                    >
                      {sale.status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Notes
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {sale.notes || "-"}
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
              Sales Items
            </CardTitle>
            <span className="text-xs text-gray-500 font-medium">
              {sale.sales_items?.length || 0} item(s)
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
                {sale.sales_items && sale.sales_items.length > 0 ? (
                  sale.sales_items.map((item, index) => (
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
                        {item.discount > 0 ? `${item.discount}%` : "-"}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs text-right py-2 px-3">
                        {item.tax > 0 ? formatCurrency(item.tax) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900 text-xs py-2 px-3">
                        {formatCurrency(item.sub_total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500 text-xs">No items found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {sale.sales_items && sale.sales_items.length > 0 && (
                <tfoot>
                  <TableRow className="bg-[#F7F7F4] border-t-2 border-[#F2F1ED] h-10">
                    <TableCell
                      colSpan={6}
                      className="text-right font-bold text-gray-900 text-xs"
                    >
                      Grand Total:
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-gray-900">
                      {formatCurrency(sale.grand_total)}
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
