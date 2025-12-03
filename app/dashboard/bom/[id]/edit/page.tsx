"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
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
import {
  useBOMs,
  useBOM,
  type BOM,
  type BOMWithDetailsRequest,
} from "@/lib/hooks/bom";
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

interface BOMFormData {
  name: string;
  type: string;
  product_id: string;
  unit_id: string;
  additional_fixed_cost: number;
  bom_details: {
    product_id: string;
    unit_id: string;
    quantity: number;
    waste: number;
  }[];
}

export default function EditBOMPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const bomId = params.id as string;

  const { loading, onEdit } = useBOMs();
  const { data: productsData } = useProducts();
  const { data: measurementUnits } = useMeasurementUnitOptions();

  // Use the useBOM hook to fetch single BOM data
  const {
    data: bomData,
    error: bomError,
    isValidating: bomLoading,
  } = useBOM(bomId);

  const form = useForm<BOMFormData>({
    defaultValues: {
      name: bomData?.name,
      type: bomData?.type,
      product_id: bomData?.product_id,
      unit_id: bomData?.unit_id,
      additional_fixed_cost: bomData?.additional_fixed_cost,
      bom_details: bomData?.bom_details,
    },
    mode: "onChange", // Enable real-time validation
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "bom_details",
  });

  // Load BOM data into form when BOM is fetched
  useEffect(() => {
    if (bomData) {
      const formData = {
        name: bomData.name,
        type: bomData.type,
        product_id: bomData.product_id,
        unit_id: bomData.unit_id,
        additional_fixed_cost: bomData.additional_fixed_cost,
        bom_details:
          bomData.bom_details?.map((detail: any) => ({
            product_id: detail.product_id,
            unit_id: detail.unit_id,
            quantity: detail.quantity,
            waste: detail.waste,
          })) || [],
      };

      // Reset the form with the BOM data
      form.reset(formData);

      // Replace the field array with the BOM details
      if (formData.bom_details.length > 0) {
        replace(formData.bom_details);
      }
    }
  }, [bomData, form, replace]);

  const handleSubmit = async (data: BOMFormData) => {
    const bomData: BOMWithDetailsRequest = {
      company_id: "", // This will be set in the hook
      name: data.name,
      type: data.type as "assembly" | "disassembly" | "menu",
      product_id: data.product_id,
      unit_id: data.unit_id,
      additional_fixed_cost: data.additional_fixed_cost,
      bom_details: data.bom_details.map((detail) => ({
        product_id: detail.product_id,
        unit_id: detail.unit_id,
        quantity: detail.quantity,
        waste: detail.waste,
      })),
    };

    await onEdit(bomId, bomData);
  };

  const addBOMDetail = () => {
    append({
      product_id: "",
      unit_id: "",
      quantity: 0,
      waste: 0,
    });
  };

  if (bomLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading BOM...</span>
      </div>
    );
  }

  if (bomError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Error loading BOM: {bomError.message}</p>
      </div>
    );
  }

  if (!bomData && !bomLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>BOM not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {bomData && (
        <>
          <BreadcrumbNav
            items={[
              { label: t.common.inventories, href: "/dashboard" },
              { label: t.bom.title, href: "/dashboard/bom" },
              { label: "Edit BOM/Recipe" },
            ]}
          />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Edit BOM/Recipe
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Update BOM/Recipe information and details
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/bom")}
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
                  Enter the basic details about the BOM/Recipe including name, type, product and unit.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium">
                      BOM/Recipe Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name", {
                        required: "Name is required",
                      })}
                      placeholder="Enter BOM/Recipe name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="type" className="text-xs font-medium">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(value) => form.setValue("type", value)}
                    >
                      <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="border-[#F2F1ED]">
                        <SelectItem value="assembly" className="text-xs">
                          {t.bom.assembly}
                        </SelectItem>
                        <SelectItem value="disassembly" className="text-xs">
                          {t.bom.disassembly}
                        </SelectItem>
                        <SelectItem value="menu" className="text-xs">{t.bom.menu}</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.type && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.type.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="product_id" className="text-xs font-medium">
                      Product <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.watch("product_id")}
                      onValueChange={(value) =>
                        form.setValue("product_id", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent className="border-[#F2F1ED]">
                        {productsData?.records?.map((product) => (
                          <SelectItem key={product.id} value={product.id} className="text-xs">
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.product_id && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.product_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="unit_id" className="text-xs font-medium">
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.watch("unit_id")}
                      onValueChange={(value) => form.setValue("unit_id", value)}
                    >
                      <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent className="border-[#F2F1ED]">
                        {measurementUnits?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id} className="text-xs">
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.unit_id && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.unit_id.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="additional_fixed_cost" className="text-xs font-medium">
                    Additional Fixed Cost (Rp)
                  </Label>
                  <Input
                    id="additional_fixed_cost"
                    type="number"
                    step="1"
                    {...form.register("additional_fixed_cost", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Cost must be positive" },
                    })}
                    placeholder="0"
                  />
                  {form.formState.errors.additional_fixed_cost && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.additional_fixed_cost.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* BOM Details Section */}
            <Card className="border-2 border-[#F2F1ED]">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      BOM Details
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-1">
                      Define the ingredients and quantities for this BOM/Recipe.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBOMDetail}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Detail
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {fields.map((field, index) => (
              <Card key={field.id} className="border-2 border-[#F2F1ED]">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Detail {index + 1}
                      </CardTitle>
                      <p className="text-xs text-gray-600 mt-1">
                        Configure product, unit, quantity, and waste settings.
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        Product <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.watch(`bom_details.${index}.product_id`)}
                        onValueChange={(value) =>
                          form.setValue(
                            `bom_details.${index}.product_id`,
                            value
                          )
                        }
                      >
                        <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent className="border-[#F2F1ED]">
                          {productsData?.records?.map((product) => (
                            <SelectItem key={product.id} value={product.id} className="text-xs">
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        Unit <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.watch(`bom_details.${index}.unit_id`)}
                        onValueChange={(value) =>
                          form.setValue(`bom_details.${index}.unit_id`, value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                          <SelectValue placeholder="Select Unit" />
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
                      <Label className="text-xs font-medium">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`bom_details.${index}.quantity`, {
                          valueAsNumber: true,
                          required: "Quantity is required",
                          min: {
                            value: 0.01,
                            message: "Quantity must be greater than 0",
                          },
                        })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Waste (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`bom_details.${index}.waste`, {
                          valueAsNumber: true,
                          min: {
                            value: 0,
                            message: "Waste must be positive",
                          },
                        })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Action Buttons */}
            <div className="flex justify-end gap-1.5 pt-4 border-t border-[#F2F1ED]">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/bom")}
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
                  "Update BOM/Recipe"
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
