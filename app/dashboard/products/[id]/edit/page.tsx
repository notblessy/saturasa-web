"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    if (!product || !product.id) return;
    form.reset({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      purchasable: product.purchasable ?? true,
      salesable: product.salesable ?? true,
      notes: product.notes,
      specifications: product.specifications || [],
    });
  }, [product, form]);

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
    <div className="space-y-6">
      {product && product?.id !== "" && (
        <div className="max-w-7xl mx-auto">
          <BreadcrumbNav
            items={[
              { label: t.common.inventories, href: "/dashboard" },
              { label: t.products.title, href: "/dashboard/products" },
              { label: "Edit Product" },
            ]}
          />

          <div className="flex items-center gap-4">
            <div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                className="flex items-center gap-2 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 m-0">
                  Edit Product
                </h1>
                <p className="text-gray-400">
                  Update product information and specifications
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
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
                      {...form.register("name")}
                      placeholder="Enter product name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={form.watch("category_id")}
                      onValueChange={(value) =>
                        form.setValue("category_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category_id && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.category_id.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    {...form.register("notes")}
                    placeholder="Enter product notes or description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={form.watch("purchasable")}
                      onCheckedChange={(checked) =>
                        form.setValue("purchasable", checked)
                      }
                      className="data-[state=checked]:bg-[#14B8A6]"
                    />
                    <Label htmlFor="purchasable">Purchasable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={form.watch("salesable")}
                      onCheckedChange={(checked) =>
                        form.setValue("salesable", checked)
                      }
                      className="data-[state=checked]:bg-[#14B8A6]"
                    />
                    <Label htmlFor="salesable">Salesable</Label>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Product Specifications
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
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
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Specification
                  </Button>
                </div>

                {fields.length > 0 ? (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
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
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Measurement Unit *</Label>
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
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {measurementUnits?.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.name} ({unit.symbol})
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
                            {...form.register(
                              `specifications.${index}.base_price`
                            )}
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
                            {...form.register(
                              `specifications.${index}.conversion_factor`
                            )}
                            placeholder="1.0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Input
                            {...form.register(`specifications.${index}.notes`)}
                            placeholder="Specification notes"
                          />
                        </div>
                      </div>

                      {/* Flags */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Unit Types
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                              <Label className="text-sm">
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p>No specifications added yet</p>
                    <p className="text-sm">
                      Click "Add Specification" to add measurement units and
                      pricing
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
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
      )}
    </div>
  );
}
