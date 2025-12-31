"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
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
import {
  usePurchaseInvoices,
  PurchaseRequest,
  PurchaseItemRequest,
} from "@/lib/hooks/purchase-invoices";
import { useSupplierOptions } from "@/lib/hooks/suppliers";
import { useProductOptions } from "@/lib/hooks/products";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";
import { useBranchOptions } from "@/lib/hooks/branches";
import {
  useDocumentTemplateByType,
  useDocumentTemplates,
} from "@/lib/hooks/invoice-templates";
import { useAuth } from "@/lib/context/auth";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";

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

export default function NewPurchaseInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { loading, onAdd } = usePurchaseInvoices();
  const { data: suppliers, loading: suppliersLoading } = useSupplierOptions();
  const { data: products, loading: productsLoading } = useProductOptions();
  const { data: measurementUnits, loading: unitsLoading } =
    useMeasurementUnitOptions();
  const { data: branches, loading: branchesLoading } = useBranchOptions();
  const { template } = useDocumentTemplateByType("INVOICE");
  const { onGeneratePreview, onIncrementSequence } = useDocumentTemplates();
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

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

  const invoiceDate = form.watch("invoice_date");
  const branchId = form.watch("branch_id");

  // Auto-generate invoice number when branch and date are selected
  useEffect(() => {
    if (
      template &&
      branchId &&
      invoiceDate &&
      !form.getValues("invoice_number")
    ) {
      generateInvoiceNumber();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id, branchId, invoiceDate]);

  const generateInvoiceNumber = async () => {
    if (!template || !branchId || !invoiceDate) {
      return;
    }

    setGeneratingInvoice(true);
    try {
      const selectedBranch = branches.find((b) => b.id === branchId);
      // Use first 3 characters of branch name as code, or default to "BR"
      const branchCode =
        selectedBranch?.name
          ?.substring(0, 3)
          .toUpperCase()
          .replace(/\s/g, "") || "BR";
      // Use "COMP" as default company code (can be enhanced later with actual company code)
      const companyCode = "COMP";

      const result = await onGeneratePreview(template.id, {
        company_code: companyCode,
        branch_code: branchCode,
        issued_date: invoiceDate,
      });

      if (result?.document_number) {
        form.setValue("invoice_number", result.document_number);
      }
    } catch (error) {
      console.error("Failed to generate invoice number:", error);
    } finally {
      setGeneratingInvoice(false);
    }
  };

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

    // Check if invoice number was generated from template
    const wasGenerated =
      template && values.invoice_number && values.invoice_number !== "";

    try {
      await onAdd(purchaseData);

      // Increment document sequence after successful creation
      // Note: onAdd navigates away on success, so this will only run if creation succeeds
      if (wasGenerated && template) {
        await onIncrementSequence(template.id);
      }
    } catch (error) {
      // Error handling is done in onAdd
    }
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
    <div className="max-w-6xl mx-auto space-y-4 pb-8">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Invoices", href: "/dashboard/purchase-invoices" },
          { label: "New Purchase Invoice" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Create Purchase Invoice
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Record a new purchase invoice from your supplier. Fill in the
            supplier details, invoice information, and add the items you're
            purchasing.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/purchase-invoices")}
        >
          Back to List
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Supplier & Invoice Details</CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Enter the supplier information and invoice details for this
              purchase invoice.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="branch_id" className="text-xs font-medium">
                  Delivery Branch <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="branch_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select delivery branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch.id}
                            value={branch.id}
                            className="text-sm"
                          >
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.branch_id && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.branch_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice_number" className="text-xs font-medium">
                  Invoice Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-1.5">
                  <Input
                    id="invoice_number"
                    {...form.register("invoice_number")}
                    placeholder="Enter invoice number or generate automatically"
                    className="flex-1"
                  />
                  {template && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateInvoiceNumber}
                      disabled={!branchId || !invoiceDate || generatingInvoice}
                      title="Generate invoice number from template"
                    >
                      {generatingInvoice ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
                {form.formState.errors.invoice_number && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.invoice_number.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplier_id" className="text-xs font-medium">
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="supplier_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Choose supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.id}
                            value={supplier.id}
                            className="text-sm"
                          >
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.supplier_id && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.supplier_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice_date" className="text-xs font-medium">
                  Invoice Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoice_date"
                  type="date"
                  {...form.register("invoice_date")}
                />
                {form.formState.errors.invoice_date && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.invoice_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="delivery_date" className="text-xs font-medium">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="delivery_date"
                  type="date"
                  {...form.register("delivery_date")}
                />
                {form.formState.errors.delivery_date && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.delivery_date.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Purchase Items</CardTitle>
                <p className="text-xs text-gray-600 mt-1">
                  Add the products, ingredients, or items you're purchasing from
                  the supplier.
                </p>
              </div>
              <Button type="button" onClick={addItem} variant="outline">
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">No items added yet</p>
                <p className="text-xs text-gray-400">
                  Click "Add Item" above to start adding products to this
                  purchase invoice
                </p>
              </div>
            ) : (
              <div className="border border-[#F2F1ED] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent h-7">
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Product
                      </TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Description
                      </TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Quantity
                      </TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Unit
                      </TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Unit Price
                      </TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Discount (%)
                      </TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Tax
                      </TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">
                        Line Total
                      </TableHead>
                      <TableHead className="text-right font-medium text-xs py-2 px-3">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const item = form.watch(`items.${index}`);
                      const productId = form.watch(`items.${index}.product_id`);
                      return (
                        <TableRow key={field.id} className="h-8">
                          <TableCell className="py-1.5 px-2">
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
                                  <SelectTrigger className="w-[200px] h-7">
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={product.id}
                                        className="text-sm"
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
                          <TableCell className="py-1.5 px-2">
                            <Input
                              {...form.register(`items.${index}.description`)}
                              placeholder="Description"
                              className="w-[150px] h-7"
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Controller
                              name={`items.${index}.quantity`}
                              control={form.control}
                              render={({ field }) => (
                                <NumericFormat
                                  value={field.value || ""}
                                  onValueChange={(values) => {
                                    field.onChange(values.floatValue || 0);
                                  }}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  decimalScale={2}
                                  allowNegative={false}
                                  customInput={Input}
                                  className="w-[100px] h-7"
                                />
                              )}
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
                          <TableCell className="py-1.5 px-2">
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
                                  <SelectTrigger className="w-[120px] h-7">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {productId
                                      ? getProductUnits(productId).map(
                                          (unit) => (
                                            <SelectItem
                                              key={unit.id}
                                              value={unit.id}
                                              className="text-sm"
                                            >
                                              {unit.symbol || unit.name}
                                            </SelectItem>
                                          )
                                        )
                                      : measurementUnits.map((unit) => (
                                          <SelectItem
                                            key={unit.id}
                                            value={unit.id}
                                            className="text-sm"
                                          >
                                            {unit.symbol || unit.name}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Controller
                              name={`items.${index}.price`}
                              control={form.control}
                              render={({ field }) => (
                                <NumericFormat
                                  value={field.value || ""}
                                  onValueChange={(values) => {
                                    field.onChange(values.floatValue || 0);
                                  }}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  decimalScale={2}
                                  allowNegative={false}
                                  customInput={Input}
                                  className="w-[100px] h-7"
                                />
                              )}
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
                          <TableCell className="py-1.5 px-2">
                            <Controller
                              name={`items.${index}.discount`}
                              control={form.control}
                              render={({ field }) => (
                                <NumericFormat
                                  value={field.value || ""}
                                  onValueChange={(values) => {
                                    field.onChange(values.floatValue || 0);
                                  }}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  decimalScale={2}
                                  allowNegative={false}
                                  max={100}
                                  customInput={Input}
                                  className="w-[80px] h-7"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Controller
                              name={`items.${index}.tax`}
                              control={form.control}
                              render={({ field }) => (
                                <NumericFormat
                                  value={field.value || ""}
                                  onValueChange={(values) => {
                                    field.onChange(values.floatValue || 0);
                                  }}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  decimalScale={2}
                                  allowNegative={false}
                                  customInput={Input}
                                  className="w-[100px] h-7"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-xs py-1.5 px-2">
                            {formatCurrency(calculateItemAmount(item))}
                          </TableCell>
                          <TableCell className="text-right py-1.5 px-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                            >
                              Remove
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
              <p className="text-xs text-red-500 mt-2">
                {form.formState.errors.items.message}
              </p>
            )}
          </CardContent>
        </Card>

        {fields.length > 0 && (
          <div className="flex justify-end">
            <div className="w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                  <span className="text-gray-700 font-medium text-xs">
                    Subtotal
                  </span>
                  <span className="font-semibold text-gray-900 text-xs">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-900 font-semibold text-sm">
                    Total Amount
                  </span>
                  <span className="font-bold text-base text-gray-900">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-1.5 pt-4 border-t border-[#F2F1ED]">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-invoices")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[180px]">
            {loading ? "Processing..." : "Create Purchase Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
