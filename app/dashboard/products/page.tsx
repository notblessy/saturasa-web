"use client";

import type React from "react";

import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useProducts } from "@/lib/hooks/products";
import { useCategoryOptions } from "@/lib/hooks/categories";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";

interface Product {
  id: string;
  slug: string;
  company_id: string;
  name: string;
  description?: string;
  sku: string;
  category_id: string;
  measurement_unit_id: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export default function ProductsPage() {
  const {
    data: productsData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  } = useProducts();

  const { data: categories } = useCategoryOptions();
  const { data: measurementUnits } = useMeasurementUnitOptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category_id: "",
    measurement_unit_id: "",
    price: "",
    cost: "",
    stock_quantity: "",
    min_stock_level: "",
  });

  const products = productsData?.records || [];

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      sku: "",
      category_id: "",
      measurement_unit_id: "",
      price: "",
      cost: "",
      stock_quantity: "",
      min_stock_level: "",
    });
    setIsSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      category_id: product.category_id,
      measurement_unit_id: product.measurement_unit_id,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_stock_level: product.min_stock_level.toString(),
    });
    setIsSheetOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      sku: formData.sku,
      category_id: formData.category_id,
      measurement_unit_id: formData.measurement_unit_id,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock_quantity: parseInt(formData.stock_quantity),
      min_stock_level: parseInt(formData.min_stock_level),
    };

    if (editingProduct) {
      await onEdit({ ...editingProduct, ...productData });
    } else {
      await onAdd(productData);
    }
    setIsSheetOpen(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getMeasurementUnitName = (unitId: string) => {
    const unit = measurementUnits.find((u) => u.id === unitId);
    return unit ? `${unit.name} (${unit.label})` : "Unknown"; // Changed from unit.symbol to unit.label
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Inventories", href: "/dashboard" },
          { label: "Products" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <Button
          onClick={handleAddProduct}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading products...</p>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      {getCategoryName(product.category_id)}
                    </TableCell>
                    <TableCell>
                      {getMeasurementUnitName(product.measurement_unit_id)}
                    </TableCell>
                    <TableCell>
                      Rp{Number(product.price).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          disabled={editLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <SheetDescription>
              {editingProduct
                ? "Update product information"
                : "Create a new product"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="Enter SKU"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Measurement Unit</Label>
                <Select
                  value={formData.measurement_unit_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, measurement_unit_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock Level</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_stock_level: e.target.value,
                    })
                  }
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={loading || editLoading}
            >
              {loading || editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingProduct ? "Updating..." : "Adding..."}
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
