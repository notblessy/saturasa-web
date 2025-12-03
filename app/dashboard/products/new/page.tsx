"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/saturasui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/saturasui/card";
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
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/dashboard/products" },
          { label: "New Product" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Create Product
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Add a new product to your inventory with pricing and measurement
            specifications.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-2 border-[#F2F1ED]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Basic Information
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Enter the basic details about the product including name, category
              and availability options.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="border-[#F2F1ED]">
                    {categories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="text-xs"
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

        <Card className="border-2 border-[#F2F1ED]">
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
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Specification
              </Button>
            </div>
          </CardHeader>
        </Card>

        {formData.specifications.map((spec, index) => (
          <Card key={index} className="border-2 border-[#F2F1ED]">
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
                  onClick={() => removeSpecification(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="border-[#F2F1ED]">
                        {measurementUnits.map((unit) => (
                          <SelectItem
                            key={unit.id}
                            value={unit.id}
                            className="text-xs"
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

        <div className="flex justify-end gap-1.5 pt-4 border-t border-[#F2F1ED]">
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
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
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
