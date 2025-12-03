"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";

import { useProducts, useProduct, Product } from "@/lib/hooks/products";
import { useCategoryOptions } from "@/lib/hooks/categories";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";

// ✅ Zod schema
const specificationSchema = z.object({
  id: z.string().optional(),
  measurement_unit_id: z.string().min(1, "Measurement unit is required"),
  base_price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) || 0 : val)),
  conversion_factor: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) || 1 : val)),
  notes: z.string().optional(),
  is_base_unit: z.boolean().default(false),
  is_stock_unit: z.boolean().default(false),
  is_purchase_unit: z.boolean().default(false),
  is_sales_unit: z.boolean().default(false),
});

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  category_id: z.string().min(1, "Category is required"),
  purchasable: z.boolean().default(true),
  salesable: z.boolean().default(true),
  notes: z.string().optional(),
  specifications: z.array(specificationSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { loading, onEdit } = useProducts();
  const { data: categories, loading: categoriesLoading } = useCategoryOptions();
  const { data: measurementUnits, loading: measurementUnitsLoading } =
    useMeasurementUnitOptions();

  const { product, isLoading: productLoading, error } = useProduct(productId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category_id: "",
      purchasable: true,
      salesable: true,
      notes: "",
      specifications: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  useEffect(() => {
    if (product?.id) {
      form.reset({
        id: product.id,
        name: product.name,
        category_id: product.category_id,
        purchasable: product.purchasable,
        salesable: product.salesable,
        notes: product.notes,
        specifications: product.specifications || [],
      });
    }
  }, [product?.id]);

  const handleSubmit = async (values: FormValues) => {
    const productData: Product = {
      ...product!,
      ...values,
      specifications: values.specifications?.map((spec) => ({
        ...spec,
        notes: spec.notes ?? "",
      })),
    };
    await onEdit(productData);
  };

  if (productLoading || categoriesLoading || measurementUnitsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Error loading product: {error.message}</p>
      </div>
    );
  }

  if (!product && !productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {product && product?.id !== "" && (
        <>
          <BreadcrumbNav
            items={[
              { label: t.common.inventories, href: "/dashboard" },
              { label: t.products.title, href: "/dashboard/products" },
              { label: "Edit Product" },
            ]}
          />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Edit Product
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Update product information and specifications
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
            >
              Back to List
            </Button>
          </div>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Basic Information */}
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
                    <Label htmlFor="name" className="text-xs font-medium">Product Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter product name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-medium">Category *</Label>
                    <Select
                      value={form.watch("category_id")}
                      onValueChange={(value) => {
                        if (value) {
                          form.setValue("category_id", value);
                          return;
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border-[#F2F1ED]">
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-xs">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category_id && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.category_id.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-medium">Notes</Label>
                  <Input
                    id="notes"
                    {...form.register("notes")}
                    placeholder="Enter product notes or description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={form.watch("purchasable")}
                      onCheckedChange={(checked) =>
                        form.setValue("purchasable", checked)
                      }
                      className="data-[state=checked]:bg-[#14B8A6]"
                    />
                    <Label htmlFor="purchasable" className="text-xs font-medium">
                      Available for Purchase
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={form.watch("salesable")}
                      onCheckedChange={(checked) =>
                        form.setValue("salesable", checked)
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

            {/* Specifications */}
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
                    onClick={() =>
                      append({
                        measurement_unit_id: "",
                        base_price: 0,
                        conversion_factor: 1,
                        notes: "",
                        is_base_unit: false,
                        is_stock_unit: false,
                        is_purchase_unit: false,
                        is_sales_unit: false,
                      })
                    }
                    variant="outline"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Specification
                  </Button>
                </div>
              </CardHeader>
              {fields.length === 0 && (
                <CardContent>
                  <div className="text-center py-10 border-2 border-dashed border-[#F2F1ED] rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      No specifications added yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Click "Add Specification" above to add measurement units and
                      pricing information
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {fields.length > 0 &&
              fields.map((field, index) => (
                <Card key={field.id} className="border-2 border-[#F2F1ED]">
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
                        onClick={() => remove(index)}
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
                            value={form.watch(
                              `specifications.${index}.measurement_unit_id`
                            )}
                            onValueChange={(val) =>
                              form.setValue(
                                `specifications.${index}.measurement_unit_id`,
                                val
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent className="border-[#F2F1ED]">
                              {measurementUnits?.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id} className="text-xs">
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
                            {...form.register(
                              `specifications.${index}.base_price`
                            )}
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
                            {...form.register(
                              `specifications.${index}.conversion_factor`
                            )}
                            placeholder="1.0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Notes</Label>
                          <Input
                            {...form.register(`specifications.${index}.notes`)}
                            placeholder="Specification notes"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-medium">Unit Types</Label>
                        <div className="space-y-3">
                          {(
                            [
                              "is_base_unit",
                              "is_stock_unit",
                              "is_purchase_unit",
                              "is_sales_unit",
                            ] as const
                          ).map((flag) => (
                            <div
                              key={flag}
                              className="flex items-center space-x-2"
                            >
                              <Switch
                                checked={
                                  form.watch(
                                    `specifications.${index}.${flag}`
                                  ) as boolean
                                }
                                onCheckedChange={(checked) =>
                                  form.setValue(
                                    `specifications.${index}.${flag}`,
                                    checked
                                  )
                                }
                                className="data-[state=checked]:bg-[#14B8A6]"
                              />
                              <Label className="text-xs">
                                {flag
                                  .replace("is_", "")
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Actions */}
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
                className="bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
