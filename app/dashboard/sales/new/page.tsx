"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import { CurrencyInput } from "@/components/saturasui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/saturasui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { useSales, SalesRequest } from "@/lib/hooks/sales";
import { useCustomerOptions } from "@/lib/hooks/customers";
import { QuickCreateDialog } from "@/components/quick-create-dialog";
import { useProductOptions } from "@/lib/hooks/products";
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units";
import { useBranchOptions } from "@/lib/hooks/branches";
import { useAuth } from "@/lib/context/auth";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

const itemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit_id: z.string().nullable().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  discount: z.number().min(0).max(100).default(0),
  tax: z.number().min(0).default(0),
});

const formSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  branch_id: z.string().min(1, "Branch is required"),
  sales_date: z.string().min(1, "Sales date is required"),
  notes: z.string().optional(),
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

export default function NewSalePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { loading, onAdd } = useSales();
  const {
    data: customers,
    loading: customersLoading,
    onQuickCreate: onQuickCreateCustomer,
  } = useCustomerOptions();
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const { data: products, loading: productsLoading } = useProductOptions();
  const { data: measurementUnits, loading: unitsLoading } =
    useMeasurementUnitOptions();
  const { data: branches, loading: branchesLoading } = useBranchOptions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      branch_id: "",
      sales_date: new Date().toISOString().split("T")[0],
      notes: "",
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
      .filter((spec) => spec.is_sales_unit || spec.is_base_unit)
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
    const salesDate = values.sales_date
      ? new Date(values.sales_date + "T00:00:00").toISOString()
      : null;

    const salesData: SalesRequest = {
      branch_id: values.branch_id,
      customer_id: values.customer_id,
      sales_date: salesDate,
      notes: values.notes || "",
      items: values.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_id: item.unit_id || null,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
      })),
    };

    try {
      await onAdd(salesData);
    } catch (error) {
      // Error handling is done in onAdd
    }
  };

  const addItem = () => {
    append({
      product_id: "",
      quantity: 0,
      unit_id: null,
      price: 0,
      discount: 0,
      tax: 0,
    });
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-8">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales" },
          { label: "New Sale" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Create Sale</h1>
          <p className="text-xs text-gray-600 mt-1">
            Record a new sale to your customer. Fill in the customer details,
            sale information, and add the items you are selling.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/sales")}
        >
          Back to List
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer & Sale Details</CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Enter the customer information and sale details for this
              transaction.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="branch_id" className="text-xs font-medium">
                  Branch <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="branch_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select branch" />
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
                <Label htmlFor="customer_id" className="text-xs font-medium">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-1.5">
                  <Controller
                    name="customer_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Choose customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem
                              key={customer.id}
                              value={customer.id}
                              className="text-sm"
                            >
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2 shrink-0"
                    onClick={() => setShowCreateCustomer(true)}
                    title="Create new customer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {form.formState.errors.customer_id && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.customer_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sales_date" className="text-xs font-medium">
                  Sales Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sales_date"
                  type="date"
                  {...form.register("sales_date")}
                />
                {form.formState.errors.sales_date && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.sales_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Optional notes for this sale"
                  className="h-8 min-h-[2rem] resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Sale Items</CardTitle>
                <p className="text-xs text-gray-600 mt-1">
                  Add the products or items you are selling to the customer.
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
                <p className="text-sm text-gray-500 mb-1">
                  No items added yet
                </p>
                <p className="text-xs text-gray-400">
                  Click "Add Item" above to start adding products to this sale
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
                                <CurrencyInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="w-[130px] h-7"
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
                                  decimalScale={0}
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
                                <CurrencyInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="w-[130px] h-7"
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
            onClick={() => router.push("/dashboard/sales")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[180px]">
            {loading ? "Processing..." : "Create Sale"}
          </Button>
        </div>
      </form>

      <QuickCreateDialog
        open={showCreateCustomer}
        onOpenChange={setShowCreateCustomer}
        title="Create New Customer"
        description="Quickly add a new customer. You can edit the full details later."
        fields={[
          {
            name: "name",
            label: "Customer Name",
            placeholder: "e.g. PT Pelanggan Utama",
            required: true,
          },
          {
            name: "contact_name",
            label: "Contact Person",
            placeholder: "e.g. Jane Doe",
            required: false,
          },
          {
            name: "contact_number",
            label: "Contact Number",
            placeholder: "e.g. 08123456789",
            required: false,
          },
        ]}
        onSubmit={async (values) => {
          return onQuickCreateCustomer(
            values.name,
            values.contact_name || "",
            values.contact_number || ""
          );
        }}
      />
    </div>
  );
}
