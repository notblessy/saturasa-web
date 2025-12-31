"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/saturasui/button";
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
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useBOMs, type BOM } from "@/lib/hooks/bom";
import { useProducts } from "@/lib/hooks/products";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";

// Utility function to format currency in Indonesian Rupiah
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BOMPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    data: bomsData,
    loading,
    deleteLoading,
    keyword,
    setKeyword,
    type: typeFilter,
    setType: setTypeFilter,
    page,
    setPage,
    size,
    setSize,
    onDelete,
  } = useBOMs();

  const { data: productsData } = useProducts();
  const { data: measurementUnits } = useMeasurementUnitOptions();

  const boms = bomsData?.records || [];
  const totalRecords = bomsData?.page_meta?.total || 0;

  const handleAddBOM = () => {
    router.push("/dashboard/bom/new");
  };

  const handleEditBOM = (bom: BOM) => {
    router.push(`/dashboard/bom/${bom.id}/edit`);
  };

  const handleDeleteBOM = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this BOM/Recipe?")) {
      await onDelete(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: t.bom.title },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{t.bom.title}</h1>
          <p className="text-xs text-gray-600 mt-1">{t.bom.subtitle}</p>
        </div>
        <Button
          onClick={handleAddBOM}
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {t.bom.addBomRecipe}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder={t.bom.searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>{t.bom.name}</TableHead>
                <TableHead>{t.bom.type}</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Additional Fixed Cost</TableHead>
                <TableHead>Details Count</TableHead>
                <TableHead className="text-right">{t.bom.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="mt-2 text-xs text-gray-500">
                      Loading BOMs...
                    </p>
                  </TableCell>
                </TableRow>
              ) : boms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-xs text-gray-500"
                  >
                    No BOMs found
                  </TableCell>
                </TableRow>
              ) : (
                boms.map((bom: BOM) => {
                  const product = productsData?.records?.find(
                    (p) => p.id === bom.product_id
                  );
                  const unit = measurementUnits?.find(
                    (u) => u.id === bom.unit_id
                  );

                  return (
                    <TableRow key={bom.id}>
                      <TableCell className="font-medium text-xs">
                        {bom.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            bom.type === "assembly"
                              ? "bg-blue-100 text-blue-800"
                              : bom.type === "disassembly"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {bom.type === "assembly"
                            ? t.bom.assembly
                            : bom.type === "disassembly"
                            ? t.bom.disassembly
                            : t.bom.menu}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {unit
                          ? `${unit.name} (${unit.symbol})`
                          : "Unknown Unit"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(Number(bom.additional_fixed_cost || 0))}
                      </TableCell>
                      <TableCell className="text-xs">
                        {bom.bom_details?.length || 0} items
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => handleEditBOM(bom)}
                            disabled={loading}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => handleDeleteBOM(bom.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalRecords > 0 && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="default"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {page} of {Math.ceil(totalRecords / size)}
              </span>
              <Button
                variant="outline"
                size="default"
                onClick={() =>
                  setPage(Math.min(Math.ceil(totalRecords / size), page + 1))
                }
                disabled={page === Math.ceil(totalRecords / size)}
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
