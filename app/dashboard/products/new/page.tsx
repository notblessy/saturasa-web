"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useProducts, ProductSpecification } from "@/lib/hooks/products";
import { useCategoryOptions } from "@/lib/hooks/categories";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";

export default function NewProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { loading, onAdd } = useProducts();
  const { data: categories } = useCategoryOptions();
  const { data: measurementUnits } = useMeasurementUnitOptions();

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    purchasable: false,
    salesable: false,
    notes: "",
    specifications: [] as {
      measurement_unit_id: string;
      base_price: string;
      conversion_factor: string;
      notes: string;
      is_base_unit: boolean;
      is_stock_unit: boolean;
      is_purchase_unit: boolean;
      is_sales_unit: boolean;
    }[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      category_id: formData.category_id,
      purchasable: formData.purchasable,
      salesable: formData.salesable,
      notes: formData.notes,
      specifications: formData.specifications.map((spec) => ({
        measurement_unit_id: spec.measurement_unit_id,
        base_price: parseFloat(spec.base_price) || 0,
        conversion_factor: parseFloat(spec.conversion_factor) || 1,
        notes: spec.notes,
        is_base_unit: spec.is_base_unit,
        is_stock_unit: spec.is_stock_unit,
        is_purchase_unit: spec.is_purchase_unit,
        is_sales_unit: spec.is_sales_unit,
      })),
    };

    await onAdd(productData);
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/dashboard/products" },
          { label: "New Product" },
        ]}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Create Product
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Add a new product to your inventory with pricing and measurement
              specifications.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
            className="text-sm"
          >
            Back to List
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Basic Information
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Enter the basic details about the product including name, category
              and availability options.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                  required
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="text-sm"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">
                Notes
              </Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Enter product notes or description"
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="purchasable"
                  checked={formData.purchasable}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      purchasable: checked as boolean,
                    })
                  }
                  className="data-[state=checked]:bg-[#14B8A6]"
                />
                <Label htmlFor="purchasable" className="text-xs font-medium">
                  Available for Purchase
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="salesable"
                  checked={formData.salesable}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      salesable: checked as boolean,
                    })
                  }
                  className="data-[state=checked]:bg-[#14B8A6]"
                />
                <Label htmlFor="salesable" className="text-xs font-medium">
                  Available for Sale
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Product Specifications
                </CardTitle>
                <p className="text-xs text-gray-600 mt-1">
                  Define measurement units, pricing, and conversion factors for
                  different product specifications.
                </p>
              </div>
              <Button
                type="button"
                onClick={addSpecification}
                variant="outline"
                className="text-sm"
              >
                Add Specification
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.specifications.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">
                  No specifications added yet
                </p>
                <p className="text-xs text-gray-400">
                  Click "Add Specification" above to add measurement units and
                  pricing information
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {formData.specifications.map((spec, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Specification {index + 1}
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-1">
                    Configure measurement unit, pricing, and conversion
                    settings.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSpecification(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Measurement Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={spec.measurement_unit_id}
                      onValueChange={(value) =>
                        updateSpecification(index, "measurement_unit_id", value)
                      }
                      required
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {measurementUnits.map((unit) => (
                          <SelectItem
                            key={unit.id}
                            value={unit.id}
                            className="text-sm"
                          >
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Base Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={spec.base_price}
                      onChange={(e) =>
                        updateSpecification(index, "base_price", e.target.value)
                      }
                      placeholder="0.00"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Conversion Factor
                    </Label>
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
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Notes</Label>
                    <Input
                      value={spec.notes}
                      onChange={(e) =>
                        updateSpecification(index, "notes", e.target.value)
                      }
                      placeholder="Specification notes"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-medium">Unit Types</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`is_base_unit_${index}`}
                        checked={spec.is_base_unit}
                        onCheckedChange={(checked) =>
                          updateSpecification(
                            index,
                            "is_base_unit",
                            checked as boolean
                          )
                        }
                        className="data-[state=checked]:bg-[#14B8A6]"
                      />
                      <Label
                        htmlFor={`is_base_unit_${index}`}
                        className="text-xs"
                      >
                        Base Unit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`is_stock_unit_${index}`}
                        checked={spec.is_stock_unit}
                        onCheckedChange={(checked) =>
                          updateSpecification(
                            index,
                            "is_stock_unit",
                            checked as boolean
                          )
                        }
                        className="data-[state=checked]:bg-[#14B8A6]"
                      />
                      <Label
                        htmlFor={`is_stock_unit_${index}`}
                        className="text-xs"
                      >
                        Stock Unit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`is_purchase_unit_${index}`}
                        checked={spec.is_purchase_unit}
                        onCheckedChange={(checked) =>
                          updateSpecification(
                            index,
                            "is_purchase_unit",
                            checked as boolean
                          )
                        }
                        className="data-[state=checked]:bg-[#14B8A6]"
                      />
                      <Label
                        htmlFor={`is_purchase_unit_${index}`}
                        className="text-xs"
                      >
                        Purchase Unit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`is_sales_unit_${index}`}
                        checked={spec.is_sales_unit}
                        onCheckedChange={(checked) =>
                          updateSpecification(
                            index,
                            "is_sales_unit",
                            checked as boolean
                          )
                        }
                        className="data-[state=checked]:bg-[#14B8A6]"
                      />
                      <Label
                        htmlFor={`is_sales_unit_${index}`}
                        className="text-xs"
                      >
                        Sales Unit
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
            disabled={loading}
            className="text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[140px] text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
