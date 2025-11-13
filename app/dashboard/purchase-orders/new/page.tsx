"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  usePurchaseOrders,
  PurchaseRequest,
  PurchaseItemRequest,
} from "@/lib/hooks/purchase-orders";
import { useSupplierOptions } from "@/lib/hooks/suppliers";
import { useProductOptions } from "@/lib/hooks/products";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";
import { useBranchOptions } from "@/lib/hooks/branches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const itemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  description: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit_id: z.string().nullable().optional(),
  discount: z.number().min(0).max(100).default(0),
  price: z.number().min(0.01, "Price must be greater than 0"),
  tax: z.number().min(0).default(0),
});

const formSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  invoice_date: z.string().min(1, "Invoice date is required"),
  delivery_date: z.string().min(1, "Delivery date is required"),
  branch_id: z.string().min(1, "Branch is required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { loading, onAdd } = usePurchaseOrders();
  const { data: suppliers, loading: suppliersLoading } = useSupplierOptions();
  const { data: products, loading: productsLoading } = useProductOptions();
  const { data: measurementUnits, loading: unitsLoading } =
    useMeasurementUnitOptions();
  const { data: branches, loading: branchesLoading } = useBranchOptions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_number: "",
      supplier_id: "",
      invoice_date: new Date().toISOString().split("T")[0],
      delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      branch_id: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedProduct = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const getProductUnits = (
    productId: string
  ): Array<{ id: string; name: string; symbol: string }> => {
    const product = selectedProduct(productId);
    if (!product || !product.specifications) return [];

    return product.specifications
      .filter((spec) => spec.is_purchase_unit || spec.is_base_unit)
      .map((spec) => ({
        id: spec.measurement_unit_id,
        name: spec.measurement_unit?.name || "",
        symbol: spec.measurement_unit?.symbol || "",
      }));
  };

  const calculateItemAmount = (item: FormValues["items"][0]): number => {
    let amount = item.quantity * item.price;
    if (item.discount > 0) {
      amount = amount * (1 - item.discount / 100);
    }
    amount += item.tax;
    return amount;
  };

  const calculateTotals = () => {
    const items = form.watch("items");
    const subtotal = items.reduce(
      (sum, item) => sum + calculateItemAmount(item),
      0
    );
    return { subtotal, total: subtotal };
  };

  const handleSubmit = async (values: FormValues) => {
    // Convert date-only strings to ISO datetime strings (RFC3339 format)
    const invoiceDate = values.invoice_date
      ? new Date(values.invoice_date + "T00:00:00").toISOString()
      : null;
    const deliveryDate = values.delivery_date
      ? new Date(values.delivery_date + "T00:00:00").toISOString()
      : null;

    const purchaseData: PurchaseRequest = {
      branch_id: values.branch_id,
      supplier_id: values.supplier_id,
      invoice_number: values.invoice_number,
      invoice_date: invoiceDate,
      delivery_date: deliveryDate,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        description: item.description || "",
        quantity: item.quantity,
        unit_id: item.unit_id || null,
        discount: item.discount,
        price: item.price,
        tax: item.tax,
      })),
    };

    await onAdd(purchaseData);
  };

  const addItem = () => {
    append({
      product_id: "",
      description: "",
      quantity: 0,
      unit_id: null,
      discount: 0,
      price: 0,
      tax: 0,
    });
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Orders", href: "/dashboard/purchase-orders" },
          { label: "New Purchase Order" },
        ]}
      />

      <Button
        variant="outline"
        onClick={() => router.push("/dashboard/purchase-orders")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">
            New Purchase Order
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Create a new purchase order
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number *</Label>
                <Input
                  id="invoice_number"
                  {...form.register("invoice_number")}
                  placeholder="e.g., INV/001"
                />
                {form.formState.errors.invoice_number && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.invoice_number.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Supplier *</Label>
                <Controller
                  name="supplier_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.supplier_id && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.supplier_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_date">Invoice Date *</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  {...form.register("invoice_date")}
                />
                {form.formState.errors.invoice_date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.invoice_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date *</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  {...form.register("delivery_date")}
                />
                {form.formState.errors.delivery_date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.delivery_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch_id">Branch *</Label>
                <Controller
                  name="branch_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.branch_id && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.branch_id.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Items</CardTitle>
              <Button type="button" onClick={addItem} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items added. Click "Add Item" to start.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product *</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity *</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price *</TableHead>
                      <TableHead>Discount (%)</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const item = form.watch(`items.${index}`);
                      const productId = form.watch(`items.${index}.product_id`);
                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Controller
                              name={`items.${index}.product_id`}
                              control={form.control}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue(
                                      `items.${index}.unit_id`,
                                      null
                                    );
                                  }}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={product.id}
                                      >
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {form.formState.errors.items?.[index]
                              ?.product_id && (
                              <p className="text-xs text-red-500 mt-1">
                                {
                                  form.formState.errors.items[index]?.product_id
                                    ?.message
                                }
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              {...form.register(`items.${index}.description`)}
                              placeholder="Description"
                              className="w-[150px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                              })}
                              className="w-[100px]"
                            />
                            {form.formState.errors.items?.[index]?.quantity && (
                              <p className="text-xs text-red-500 mt-1">
                                {
                                  form.formState.errors.items[index]?.quantity
                                    ?.message
                                }
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.unit_id`}
                              control={form.control}
                              render={({ field }) => (
                                <Select
                                  value={field.value || ""}
                                  onValueChange={(value) =>
                                    field.onChange(value || null)
                                  }
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {productId
                                      ? getProductUnits(productId).map(
                                          (unit) => (
                                            <SelectItem
                                              key={unit.id}
                                              value={unit.id}
                                            >
                                              {unit.symbol || unit.name}
                                            </SelectItem>
                                          )
                                        )
                                      : measurementUnits.map((unit) => (
                                          <SelectItem
                                            key={unit.id}
                                            value={unit.id}
                                          >
                                            {unit.symbol || unit.name}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`items.${index}.price`, {
                                valueAsNumber: true,
                              })}
                              className="w-[100px]"
                            />
                            {form.formState.errors.items?.[index]?.price && (
                              <p className="text-xs text-red-500 mt-1">
                                {
                                  form.formState.errors.items[index]?.price
                                    ?.message
                                }
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              {...form.register(`items.${index}.discount`, {
                                valueAsNumber: true,
                              })}
                              className="w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`items.${index}.tax`, {
                                valueAsNumber: true,
                              })}
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(calculateItemAmount(item))}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {form.formState.errors.items && (
              <p className="text-sm text-red-500 mt-2">
                {form.formState.errors.items.message}
              </p>
            )}
          </CardContent>
        </Card>

        {fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
                <div className="w-full max-w-md space-y-2">
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-[14px]">
                      {formatCurrency(totals.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-orders")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Purchase Order"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
