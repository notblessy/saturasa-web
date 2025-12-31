"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Plus, Trash2, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import {
  usePurchaseInvoices,
  usePurchaseInvoice,
  PurchaseRequest,
} from "@/lib/hooks/purchase-invoices";
import { ConfirmDialog } from "@/components/saturasui/confirm-dialog";
import { useSupplierOptions } from "@/lib/hooks/suppliers";
import { useProductOptions } from "@/lib/hooks/products";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";
import { useBranchOptions } from "@/lib/hooks/branches";
import {
  useDocumentTemplateByType,
  useDocumentTemplates,
} from "@/lib/hooks/invoice-templates";
import { useAuth } from "@/lib/context/auth";
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
  id: z.string().optional(),
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

export default function EditPurchaseInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const purchaseInvoiceId = params.id as string;
  const { purchase, isLoading, mutatePurchase } =
    usePurchaseInvoice(purchaseInvoiceId);
  const { loading, editLoading, statusLoading, onEdit, onUpdateStatus } =
    usePurchaseInvoices();
  const { data: suppliers, loading: suppliersLoading } = useSupplierOptions();
  const { data: products, loading: productsLoading } = useProductOptions();
  const { data: measurementUnits, loading: unitsLoading } =
    useMeasurementUnitOptions();
  const { data: branches, loading: branchesLoading } = useBranchOptions();
  const { template } = useDocumentTemplateByType("INVOICE");
  const { onGeneratePreview } = useDocumentTemplates();
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_number: "",
      supplier_id: "",
      invoice_date: "",
      delivery_date: "",
      branch_id: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Initialize form when purchase data loads
  useEffect(() => {
    if (purchase && !isLoading) {
      form.reset({
        invoice_number: purchase.invoice_number || "",
        supplier_id: purchase.supplier_id || "",
        invoice_date: purchase.invoice_date
          ? purchase.invoice_date.split("T")[0]
          : "",
        delivery_date: purchase.delivery_date
          ? purchase.delivery_date.split("T")[0]
          : "",
        branch_id: purchase.branch_id || "",
        items:
          purchase.purchase_items?.map((item, index) => ({
            id: item.id || `item-${index}`,
            product_id: item.product_id || "",
            description: "",
            quantity: Number(item.quantity) || 0,
            unit_id: item.measurement_unit_id || null,
            discount: 0,
            price: Number(item.price) || 0,
            tax: 0,
          })) || [],
      });
    }
  }, [purchase, isLoading, form]);

  const generateInvoiceNumber = async () => {
    const branchId = form.getValues("branch_id");
    const invoiceDate = form.getValues("invoice_date");

    if (!template || !branchId || !invoiceDate) {
      return;
    }

    setGeneratingInvoice(true);
    try {
      const selectedBranch = branches.find((b) => b.id === branchId);
      const branchCode =
        selectedBranch?.name
          ?.substring(0, 3)
          .toUpperCase()
          .replace(/\s/g, "") || "BR";
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

    await onEdit(purchaseInvoiceId, purchaseData);
    // Refresh the purchase data after edit
    mutatePurchase();
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (selectedStatus) {
      await onUpdateStatus(purchaseInvoiceId, selectedStatus);
      mutatePurchase();
      setStatusDialogOpen(false);
      setSelectedStatus("");
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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 pb-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!purchaseInvoiceId || (!purchase && !isLoading)) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 pb-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Purchase invoice not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-invoices")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-8">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Invoices", href: "/dashboard/purchase-invoices" },
          { label: "Edit Purchase Invoice" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Edit Purchase Invoice
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Update the purchase invoice details and items below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {purchase && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Status:</span>
              <Select
                value={purchase.status}
                onValueChange={handleStatusChange}
                disabled={statusLoading}
              >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue>
                    {purchase.status.replace(/_/g, " ").toUpperCase()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="waiting_for_payment">
                    Waiting for Payment
                  </SelectItem>
                  <SelectItem value="payment_partial">
                    Payment Partial
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/purchase-invoices/${purchaseInvoiceId}`)
            }
          >
            Back to Detail
          </Button>
        </div>
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    >
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
                  <Controller
                    name="invoice_number"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter invoice number or generate automatically"
                        className="flex-1"
                        required
                      />
                    )}
                  />
                  {template && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateInvoiceNumber}
                      disabled={
                        !form.watch("branch_id") ||
                        !form.watch("invoice_date") ||
                        generatingInvoice
                      }
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    >
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
                <Controller
                  name="invoice_date"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} type="date" required />
                  )}
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
                <Controller
                  name="delivery_date"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} type="date" required />
                  )}
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
                <Plus className="h-3.5 w-3.5 mr-1.5" />
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
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Controller
                              name={`items.${index}.description`}
                              control={form.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Description"
                                  className="w-[150px] h-7"
                                />
                              )}
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
                                    {item?.product_id
                                      ? getProductUnits(item.product_id).map(
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
                            {item
                              ? formatCurrency(calculateItemAmount(item))
                              : "Rp 0"}
                          </TableCell>
                          <TableCell className="text-right py-1.5 px-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {fields.length > 0 && (
              <div className="flex justify-end mt-4">
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-1.5 pt-4 border-t border-[#F2F1ED]">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/purchase-invoices/${purchaseInvoiceId}`)
            }
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={editLoading || fields.length === 0}
            className="min-w-[180px]"
          >
            {editLoading ? "Processing..." : "Update Purchase Invoice"}
          </Button>
        </div>
      </form>

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        title="Change Status"
        description={
          selectedStatus
            ? `Are you sure you want to change the status to ${selectedStatus
                .replace(/_/g, " ")
                .toUpperCase()}?`
            : "Are you sure you want to change the status?"
        }
        confirmText="Change Status"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        variant="default"
        loading={statusLoading}
      />
    </div>
  );
}
