"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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
    <div className="space-y-6">
      {bomData && (
        <div className="max-w-7xl mx-auto">
          <BreadcrumbNav
            items={[
              { label: t.common.inventories, href: "/dashboard" },
              { label: t.bom.title, href: "/dashboard/bom" },
              { label: "Edit BOM/Recipe" },
            ]}
          />

          <div className="flex items-center gap-4">
            <div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/bom")}
                className="flex items-center gap-2 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to BOM/Recipes
              </Button>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 m-0">
                  Edit BOM/Recipe
                </h1>
                <p className="text-gray-400">
                  Update BOM/Recipe information and details
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
                    <Label htmlFor="name">BOM/Recipe Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name", {
                        required: "Name is required",
                      })}
                      placeholder="Enter BOM/Recipe name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(value) => form.setValue("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assembly">
                          {t.bom.assembly}
                        </SelectItem>
                        <SelectItem value="disassembly">
                          {t.bom.disassembly}
                        </SelectItem>
                        <SelectItem value="menu">{t.bom.menu}</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.type && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.type.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_id">Product *</Label>
                    <Select
                      value={form.watch("product_id")}
                      onValueChange={(value) =>
                        form.setValue("product_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {productsData?.records?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.product_id && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.product_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit_id">Unit *</Label>
                    <Select
                      value={form.watch("unit_id")}
                      onValueChange={(value) => form.setValue("unit_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {measurementUnits?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.unit_id && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.unit_id.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_fixed_cost">
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
                    <p className="text-sm text-red-500">
                      {form.formState.errors.additional_fixed_cost.message}
                    </p>
                  )}
                </div>
              </div>

              {/* BOM Details Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    BOM Details
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBOMDetail}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Detail
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p>No BOM details added yet</p>
                    <p className="text-sm">
                      Click "Add Detail" to add ingredients and quantities
                    </p>
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-lg">
                        Detail {index + 1}
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
                        <Label>Product *</Label>
                        <Select
                          value={form.watch(`bom_details.${index}.product_id`)}
                          onValueChange={(value) =>
                            form.setValue(
                              `bom_details.${index}.product_id`,
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {productsData?.records?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Unit *</Label>
                        <Select
                          value={form.watch(`bom_details.${index}.unit_id`)}
                          onValueChange={(value) =>
                            form.setValue(`bom_details.${index}.unit_id`, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Unit" />
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
                        <Label>Quantity *</Label>
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
                      <div className="space-y-2">
                        <Label>Waste (%)</Label>
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
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update BOM/Recipe"
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
