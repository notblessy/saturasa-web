"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: t.bom.title },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.bom.title}</h1>
          <p className="text-gray-600 mt-2">{t.bom.subtitle}</p>
        </div>
        <Button
          onClick={handleAddBOM}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.bom.addBomRecipe}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {t.bom.bomRecipeList}
          </h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.bom.searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
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
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading BOMs...</p>
                  </TableCell>
                </TableRow>
              ) : boms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
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
                      <TableCell className="font-medium">{bom.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                      <TableCell>
                        {product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell>
                        {unit
                          ? `${unit.name} (${unit.symbol})`
                          : "Unknown Unit"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(bom.additional_fixed_cost || 0))}
                      </TableCell>
                      <TableCell>
                        {bom.bom_details?.length || 0} items
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBOM(bom)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBOM(bom.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
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
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {Math.ceil(totalRecords / size)}
              </span>
              <Button
                variant="outline"
                size="sm"
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
