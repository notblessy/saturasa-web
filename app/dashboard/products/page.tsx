"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/use-translation";
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
import { useProducts, Product } from "@/lib/hooks/products";
import { useCategoryOptions } from "@/lib/hooks/categories";

export default function ProductsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    data: productsData,
    loading,
    deleteLoading,
    onQuery,
    onDelete,
  } = useProducts();

  const { data: categories } = useCategoryOptions();

  const [searchTerm, setSearchTerm] = useState("");

  const products = productsData?.records || [];

  const handleAddProduct = () => {
    router.push("/dashboard/products/new");
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await onDelete(id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.name || t.common.unknown;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: t.products.title },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {t.products.title}
          </h1>
          <p className="text-xs text-gray-600 mt-1">{t.products.subtitle}</p>
        </div>
        <Button
          onClick={handleAddProduct}
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {t.products.addProduct}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder={t.products.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>{t.products.name}</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>BOM</TableHead>
                <TableHead>{t.products.category}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="mt-2 text-xs text-gray-500">
                      {t.products.loadingProducts}
                    </p>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-xs text-gray-500">
                      {t.products.noProductsFound}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-xs">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-xs">{product.slug || "-"}</TableCell>
                    <TableCell className="text-xs">{/* BOM column, currently empty */}</TableCell>
                    <TableCell className="text-xs">
                      {product.category?.name ||
                        getCategoryName(product.category_id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {product.purchasable && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                            Purchasable
                          </span>
                        )}
                        {product.salesable && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                            Salesable
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleEditProduct(product)}
                          disabled={loading}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleDeleteProduct(product.id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
