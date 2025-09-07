"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import {
  useProducts,
  Product,
  ProductSpecification,
} from "@/lib/hooks/products";
import { useCategoryOptions } from "@/lib/hooks/categories";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";
import useSWR from "swr";

export default function EditProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { loading, onEdit } = useProducts();
  const { data: categories } = useCategoryOptions();
  const { data: measurementUnits } = useMeasurementUnitOptions();

  // Fetch the product data
  const { data: product, isLoading: productLoading } = useSWR<{
    success: boolean;
    data: Product;
  }>(productId ? `v1/products/${productId}` : null);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    purchasable: true,
    salesable: true,
    notes: "",
    specifications: [] as {
      id?: string;
      measurement_unit_id: string;
      base_price: string;
      conversion_factor: string;
      notes: string;
      // is_default: boolean; (removed)
      is_base_unit: boolean;
      is_stock_unit: boolean;
      is_purchase_unit: boolean;
      is_sales_unit: boolean;
    }[],
  });

  // Populate form when product data is loaded
  useEffect(() => {
    if (product?.data) {
      const productData = product.data;
      setFormData({
        name: productData.name,
        category_id: productData.category_id,
        purchasable: productData.purchasable,
        salesable: productData.salesable,
        notes: productData.notes || "",
        specifications:
          productData.specifications?.map((spec) => ({
            id: spec.id,
            measurement_unit_id: spec.measurement_unit_id,
            base_price: spec.base_price.toString(),
            conversion_factor: spec.conversion_factor.toString(),
            notes: spec.notes,
            // is_default: spec.is_default, (removed)
            is_base_unit: spec.is_base_unit,
            is_stock_unit: spec.is_stock_unit,
            is_purchase_unit: spec.is_purchase_unit,
            is_sales_unit: spec.is_sales_unit,
          })) || [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product?.data) return;

    const productData = {
      ...product.data,
      name: formData.name,
      category_id: formData.category_id,
      purchasable: formData.purchasable,
      salesable: formData.salesable,
      notes: formData.notes,
      specifications: formData.specifications.map((spec) => ({
        id: spec.id,
        measurement_unit_id: spec.measurement_unit_id,
        base_price: parseFloat(spec.base_price) || 0,
        conversion_factor: parseFloat(spec.conversion_factor) || 1,
        notes: spec.notes,
        // is_default: spec.is_default, (removed)
        is_base_unit: spec.is_base_unit,
        is_stock_unit: spec.is_stock_unit,
        is_purchase_unit: spec.is_purchase_unit,
        is_sales_unit: spec.is_sales_unit,
      })),
    };

    try {
      await onEdit(productData);
      router.push("/dashboard/products");
    } catch (error) {
      // Error handling is done in the hook
      console.error("Error updating product:", error);
    }
  };

  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [
        ...formData.specifications,
        {
          measurement_unit_id: "",
          base_price: "0",
          conversion_factor: "1",
          notes: "",
          // is_default: false, (removed)
          is_base_unit: false,
          is_stock_unit: false,
          is_purchase_unit: false,
          is_sales_unit: false,
        },
      ],
    });
  };

  const removeSpecification = (index: number) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData({ ...formData, specifications: newSpecs });
  };

  const updateSpecification = (index: number, field: string, value: any) => {
    const newSpecs = [...formData.specifications];
    (newSpecs[index] as any)[field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  if (productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (!product?.data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: t.products.title, href: "/dashboard/products" },
          { label: "Edit Product" },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">
            Update product information and specifications
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
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
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                    required
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Enter product notes or description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="purchasable"
                    checked={formData.purchasable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasable: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="purchasable">Purchasable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="salesable"
                    checked={formData.salesable}
                    onChange={(e) =>
                      setFormData({ ...formData, salesable: e.target.checked })
                    }
                  />
                  <Label htmlFor="salesable">Salesable</Label>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Product Specifications
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSpecification}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Specification
                </Button>
              </div>

              {formData.specifications.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <p>No specifications added yet</p>
                  <p className="text-sm">
                    Click "Add Specification" to add measurement units and
                    pricing
                  </p>
                </div>
              )}

              {formData.specifications.map((spec, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg">
                      Specification {index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Measurement Unit *</Label>
                      <Select
                        value={spec.measurement_unit_id}
                        onValueChange={(value) =>
                          updateSpecification(
                            index,
                            "measurement_unit_id",
                            value
                          )
                        }
                        required
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
                    <div className="space-y-2">
                      <Label>Base Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={spec.base_price}
                        onChange={(e) =>
                          updateSpecification(
                            index,
                            "base_price",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Conversion Factor</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={spec.conversion_factor}
                        onChange={(e) =>
                          updateSpecification(
                            index,
                            "conversion_factor",
                            e.target.value
                          )
                        }
                        placeholder="1.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        value={spec.notes}
                        onChange={(e) =>
                          updateSpecification(index, "notes", e.target.value)
                        }
                        placeholder="Specification notes"
                      />
                    </div>
                  </div>

                  {/* Unit Type Flags */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Unit Types</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`is_base_unit_${index}`}
                          checked={spec.is_base_unit}
                          onChange={(e) =>
                            updateSpecification(
                              index,
                              "is_base_unit",
                              e.target.checked
                            )
                          }
                        />
                        <Label
                          htmlFor={`is_base_unit_${index}`}
                          className="text-sm"
                        >
                          Base Unit
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`is_stock_unit_${index}`}
                          checked={spec.is_stock_unit}
                          onChange={(e) =>
                            updateSpecification(
                              index,
                              "is_stock_unit",
                              e.target.checked
                            )
                          }
                        />
                        <Label
                          htmlFor={`is_stock_unit_${index}`}
                          className="text-sm"
                        >
                          Stock Unit
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`is_purchase_unit_${index}`}
                          checked={spec.is_purchase_unit}
                          onChange={(e) =>
                            updateSpecification(
                              index,
                              "is_purchase_unit",
                              e.target.checked
                            )
                          }
                        />
                        <Label
                          htmlFor={`is_purchase_unit_${index}`}
                          className="text-sm"
                        >
                          Purchase Unit
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`is_sales_unit_${index}`}
                          checked={spec.is_sales_unit}
                          onChange={(e) =>
                            updateSpecification(
                              index,
                              "is_sales_unit",
                              e.target.checked
                            )
                          }
                        />
                        <Label
                          htmlFor={`is_sales_unit_${index}`}
                          className="text-sm"
                        >
                          Sales Unit
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
