"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import {
  usePurchaseOrders,
  usePurchaseOrder,
  PurchaseRequest,
  PurchaseItemRequest,
} from "@/lib/hooks/purchase-orders";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/saturasui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const purchaseOrderId = params.id as string;
  const { purchase, isLoading } = usePurchaseOrder(purchaseOrderId);
  const { loading, editLoading, onEdit } = usePurchaseOrders();
  const { data: suppliers, loading: suppliersLoading } = useSupplierOptions();
  const { data: products, loading: productsLoading } = useProductOptions();
  const { data: measurementUnits, loading: unitsLoading } =
    useMeasurementUnitOptions();
  const { data: branches, loading: branchesLoading } = useBranchOptions();
  const { template } = useDocumentTemplateByType("INVOICE");
  const { onGeneratePreview } = useDocumentTemplates();
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const [formData, setFormData] = useState({
    invoice_number: "",
    supplier_id: "",
    invoice_date: "",
    delivery_date: "",
    branch_id: "",
    items: [] as (PurchaseItemRequest & { id: string })[],
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        invoice_number: purchase.invoice_number || "",
        supplier_id: purchase.supplier_id,
        invoice_date: purchase.invoice_date
          ? purchase.invoice_date.split("T")[0]
          : "",
        delivery_date: purchase.delivery_date
          ? purchase.delivery_date.split("T")[0]
          : "",
        branch_id: purchase.branch_id || "",
        items:
          purchase.purchase_items?.map((item, index) => ({
            id: item.id || index.toString(),
            product_id: item.product_id || "",
            description: "",
            quantity: Number(item.quantity),
            unit_id: item.measurement_unit_id || null,
            discount: 0,
            price: Number(item.price),
            tax: 0,
          })) || [],
      });
    }
  }, [purchase]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Math.random().toString(),
          product_id: "",
          description: "",
          quantity: 0,
          unit_id: null,
          discount: 0,
          price: 0,
          tax: 0,
        },
      ],
    });
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (
    id: string,
    field: keyof PurchaseItemRequest,
    value: any
  ) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const calculateItemAmount = (item: PurchaseItemRequest): number => {
    let amount = item.quantity * item.price;
    if (item.discount > 0) {
      amount = amount * (1 - item.discount / 100);
    }
    amount += item.tax;
    return amount;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + calculateItemAmount(item),
      0
    );
    return { subtotal, total: subtotal };
  };

  const generateInvoiceNumber = async () => {
    if (!template || !formData.branch_id || !formData.invoice_date) {
      return;
    }

    setGeneratingInvoice(true);
    try {
      const selectedBranch = branches.find((b) => b.id === formData.branch_id);
      const branchCode = selectedBranch?.name
        ?.substring(0, 3)
        .toUpperCase()
        .replace(/\s/g, "") || "BR";
      const companyCode = "COMP";

      const result = await onGeneratePreview(template.id, {
        company_code: companyCode,
        branch_code: branchCode,
        issued_date: formData.invoice_date,
      });

      if (result?.document_number) {
        setFormData({ ...formData, invoice_number: result.document_number });
      }
    } catch (error) {
      console.error("Failed to generate invoice number:", error);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate items before filtering
    const validItems = formData.items.filter(
      (item) => item.product_id && item.product_id.trim() !== ""
    );

    if (validItems.length === 0) {
      alert("Please add at least one item with a selected product");
      return;
    }

    // Validate all valid items have required fields
    for (const item of validItems) {
      if (item.quantity <= 0) {
        alert("Please enter a valid quantity for all items");
        return;
      }
      if (item.price <= 0) {
        alert("Please enter a valid price for all items");
        return;
      }
    }

    if (!formData.branch_id) {
      alert("Please select a branch");
      return;
    }

    // Convert date-only strings to ISO datetime strings (RFC3339 format)
    const invoiceDate = formData.invoice_date
      ? new Date(formData.invoice_date + "T00:00:00").toISOString()
      : null;
    const deliveryDate = formData.delivery_date
      ? new Date(formData.delivery_date + "T00:00:00").toISOString()
      : null;

    const purchaseData: PurchaseRequest = {
      branch_id: formData.branch_id,
      supplier_id: formData.supplier_id,
      invoice_number: formData.invoice_number,
      invoice_date: invoiceDate,
      delivery_date: deliveryDate,
      items: validItems.map((item) => ({
        product_id: item.product_id.trim(),
        description: item.description || "",
        quantity: item.quantity,
        unit_id: item.unit_id || null,
        discount: item.discount,
        price: item.price,
        tax: item.tax,
      })),
    };

    await onEdit(purchaseOrderId, purchaseData);
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

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!purchaseOrderId) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Purchase invoice not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-orders")}
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
          { label: "Purchase Invoices", href: "/dashboard/purchase-orders" },
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
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/dashboard/purchase-orders/${purchaseOrderId}`)
          }
        >
          Back to Detail
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Supplier & Invoice Details
            </CardTitle>
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
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch_id: value })
                  }
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice_number" className="text-xs font-medium">
                  Invoice Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-1.5">
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_number: e.target.value })
                    }
                    placeholder="Enter invoice number or generate automatically"
                    className="flex-1"
                    required
                  />
                  {template && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateInvoiceNumber}
                      disabled={!formData.branch_id || !formData.invoice_date || generatingInvoice}
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplier_id" className="text-xs font-medium">
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplier_id: value })
                  }
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice_date" className="text-xs font-medium">
                  Invoice Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invoice_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="delivery_date" className="text-xs font-medium">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  Purchase Items
                </CardTitle>
                <p className="text-xs text-gray-600 mt-1">
                  Add the products, ingredients, or items you're purchasing from
                  the supplier.
                </p>
              </div>
              <Button
                type="button"
                onClick={addItem}
                variant="outline"
              >
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 ? (
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
                      <TableHead className="font-medium text-xs py-2 px-3">Product</TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">Description</TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">Quantity</TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">Unit</TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">Unit Price</TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">Discount (%)</TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">Tax</TableHead>
                      <TableHead className="font-medium text-xs py-2 px-3">Line Total</TableHead>
                      <TableHead className="text-right font-medium text-xs py-2 px-3">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {formData.items.map((item) => (
                        <TableRow key={item.id} className="h-8">
                          <TableCell className="py-1.5 px-2">
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => {
                                updateItem(item.id, "product_id", value);
                                updateItem(item.id, "unit_id", null);
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
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Input
                              value={item.description || ""}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Description"
                              className="w-[150px] h-7"
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <NumericFormat
                              value={item.quantity || ""}
                              onValueChange={(values) => {
                                updateItem(
                                  item.id,
                                  "quantity",
                                  values.floatValue || 0
                                );
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              decimalScale={2}
                              allowNegative={false}
                              customInput={Input}
                              className="w-[100px] h-7"
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <Select
                              value={item.unit_id || ""}
                              onValueChange={(value) =>
                                updateItem(item.id, "unit_id", value || null)
                              }
                            >
                              <SelectTrigger className="w-[120px] h-7">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.product_id
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
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <NumericFormat
                              value={item.price || ""}
                              onValueChange={(values) => {
                                updateItem(
                                  item.id,
                                  "price",
                                  values.floatValue || 0
                                );
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              decimalScale={2}
                              allowNegative={false}
                              customInput={Input}
                              className="w-[100px] h-7"
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <NumericFormat
                              value={item.discount || ""}
                              onValueChange={(values) => {
                                updateItem(
                                  item.id,
                                  "discount",
                                  values.floatValue || 0
                                );
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              decimalScale={2}
                              allowNegative={false}
                              max={100}
                              customInput={Input}
                              className="w-[80px] h-7"
                            />
                          </TableCell>
                          <TableCell className="py-1.5 px-2">
                            <NumericFormat
                              value={item.tax || ""}
                              onValueChange={(values) => {
                                updateItem(
                                  item.id,
                                  "tax",
                                  values.floatValue || 0
                                );
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              decimalScale={2}
                              allowNegative={false}
                              customInput={Input}
                              className="w-[100px] h-7"
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
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
            {formData.items.length > 0 && (
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
              router.push(`/dashboard/purchase-orders/${purchaseOrderId}`)
            }
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={editLoading || formData.items.length === 0}
            className="min-w-[180px]"
          >
            {editLoading ? "Processing..." : "Update Purchase Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
