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
import { useProduction } from "@/lib/hooks/productions";
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

export default function ProductionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params.id as string;
  const { production, isLoading } = useProduction(productionId);

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

  if (!production) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <BreadcrumbNav
          items={[
            { label: "Dashboard", href: "/dashboard" },
            {
              label: "Productions",
              href: "/dashboard/productions",
            },
            { label: "Detail" },
          ]}
        />
        <div className="text-center py-12">
          <p className="text-xs text-gray-500">Production not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/productions")}
            className="mt-4"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Productions
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
          { label: "Productions", href: "/dashboard/productions" },
          { label: "Detail" },
        ]}
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Production Detail
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600 text-xs">
              BOM:{" "}
              <span className="font-semibold text-gray-900">
                {production.bom?.name || "-"}
              </span>
            </p>
            <span className="text-gray-300">•</span>
            <p className="text-gray-600 text-xs">
              Created:{" "}
              <span className="font-medium">
                {formatDate(production.created_at)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            className={
              statusColors[production.status] || "bg-gray-100 text-gray-800"
            }
          >
            {production.status.toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/productions")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-[#E8E8E3] border-b border-[#D4D4CF] p-3">
          <CardTitle className="text-xs font-semibold">
            Production Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableBody>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="w-1/3 font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    BOM Name
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 text-xs py-2 px-3">
                    {production.bom?.name || "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Product
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {production.bom?.product?.name || "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Status
                  </TableCell>
                  <TableCell className="text-xs py-2 px-3">
                    <Badge
                      className={`${
                        statusColors[production.status] ||
                        "bg-gray-100 text-gray-800"
                      } text-xs`}
                    >
                      {production.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Branch
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {production.branch?.name || "-"}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Quantity
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {production.quantity}
                    {production.bom?.measurement_unit?.symbol && (
                      <span className="ml-1 text-gray-500">
                        {production.bom.measurement_unit.symbol}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Created At
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {formatDateTime(production.created_at)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-[#F2F1ED]">
                  <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                    Updated At
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                    {formatDateTime(production.updated_at)}
                  </TableCell>
                </TableRow>
                {production.notes && (
                  <TableRow>
                    <TableCell className="font-medium text-gray-700 bg-[#F7F7F4] text-xs py-2 px-3">
                      Notes
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 text-xs py-2 px-3">
                      {production.notes}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-[#E8E8E3] border-b border-[#D4D4CF] p-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs font-semibold">
              Production Items
            </CardTitle>
            <span className="text-xs text-gray-500 font-medium">
              {production.production_items?.length || production.bom?.bom_details?.length || 0} item(s)
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
                    Required Quantity
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-center py-2 px-3">
                    Unit
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-center py-2 px-3">
                    Waste (%)
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-center py-2 px-3">
                    Actual Used
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {production.production_items && production.production_items.length > 0 ? (
                  production.production_items.map((item, index) => (
                    <TableRow
                      key={item.id || index}
                      className="hover:bg-[#F7F7F4] transition-colors border-b border-[#F2F1ED]"
                    >
                      <TableCell className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-900">
                            {item.product?.name || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-center text-xs py-2 px-3">
                        {item.bom_detail?.quantity || "-"}
                      </TableCell>
                      <TableCell className="text-center py-2 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                          {item.bom_detail?.measurement_unit?.symbol ||
                            item.bom_detail?.measurement_unit?.name ||
                            "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-gray-500 text-xs py-2 px-3">
                        {item.bom_detail?.waste || 0}%
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-center text-xs py-2 px-3">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : production.bom?.bom_details && production.bom.bom_details.length > 0 ? (
                  production.bom.bom_details.map((detail, index) => (
                    <TableRow
                      key={detail.id || index}
                      className="hover:bg-[#F7F7F4] transition-colors border-b border-[#F2F1ED]"
                    >
                      <TableCell className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-900">
                            {detail.product?.name || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-center text-xs py-2 px-3">
                        {detail.quantity}
                      </TableCell>
                      <TableCell className="text-center py-2 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                          {detail.measurement_unit?.symbol ||
                            detail.measurement_unit?.name ||
                            "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-gray-500 text-xs py-2 px-3">
                        {detail.waste || 0}%
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 text-center text-xs py-2 px-3">
                        {((detail.quantity * production.quantity) * (1 + (detail.waste || 0) / 100)).toFixed(4)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500 text-xs">No items found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

