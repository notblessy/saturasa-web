"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  usePurchaseOrder,
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
  const purchaseOrderId = params.id as string;
  const { purchase, isLoading } = usePurchaseOrder(purchaseOrderId);
  const { loading, editLoading, onEdit } = usePurchaseOrders();
  const { data: suppliers, loading: suppliersLoading } = useSupplierOptions();
  const { data: products, loading: productsLoading } = useProductOptions();
  const { data: measurementUnits, loading: unitsLoading } =
    useMeasurementUnitOptions();
  const { data: branches, loading: branchesLoading } = useBranchOptions();

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
        invoice_date: purchase.invoice_date ? purchase.invoice_date.split("T")[0] : "",
        delivery_date: purchase.delivery_date ? purchase.delivery_date.split("T")[0] : "",
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

  const getProductUnits = (productId: string) => {
    const product = selectedProduct(productId);
    if (!product || !product.specifications) return [];

    return product.specifications
      .filter((spec) => spec.is_purchase_unit)
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

  if (!purchaseOrder) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Purchase order not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/purchase-orders")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
        </div>
      </div>
    );
  }

  if (purchaseOrder.status !== "pending") {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">
            Only purchase orders with pending status can be edited
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/purchase-orders/${purchaseOrderId}`)}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Orders", href: "/dashboard/purchase-orders" },
          { label: "Edit Purchase Order" },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/purchase-orders/${purchaseOrderId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">
            Edit Purchase Order
          </h1>
          <p className="text-gray-600 mt-2 text-sm">Update purchase order details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.invoice_number}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_number: e.target.value })
                  }
                  placeholder="e.g., INV/001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Supplier *</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplier_id: value })
                  }
                  required
                >
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_date">Invoice Date *</Label>
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
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date *</Label>
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
              <div className="space-y-2">
                <Label htmlFor="branch_id">Branch *</Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch_id: value })
                  }
                  required
                >
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
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items added. Click "Add Item" to start.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Discount %</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => {
                                updateItem(item.id, "product_id", value);
                                updateItem(item.id, "unit_id", null);
                              }}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.description || ""}
                              onChange={(e) =>
                                updateItem(item.id, "description", e.target.value)
                              }
                              placeholder="Description"
                              className="w-[150px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.unit_id || ""}
                              onValueChange={(value) =>
                                updateItem(item.id, "unit_id", value || null)
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.product_id
                                  ? getProductUnits(item.product_id).map((unit) => (
                                      <SelectItem key={unit.id} value={unit.id}>
                                        {unit.symbol || unit.name}
                                      </SelectItem>
                                    ))
                                  : measurementUnits.map((unit) => (
                                      <SelectItem key={unit.id} value={unit.id}>
                                        {unit.symbol || unit.name}
                                      </SelectItem>
                                    ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-[120px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "discount",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.tax}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "tax",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(calculateItemAmount(item))}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <div className="text-right space-y-2">
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
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/purchase-orders/${purchaseOrderId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={editLoading || formData.items.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {editLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Purchase Order"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

