"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Plus, Edit, Trash2, Search, Minus } from "lucide-react"
import { useTranslation } from "@/lib/hooks/use-translation"
import { useBOMs, type BOM, type BOMDetail, type BOMWithDetailsRequest } from "@/lib/hooks/bom"
import { useProducts } from "@/lib/hooks/products"
import { useMeasurementUnitOptions } from "@/lib/hooks/measurement_units"


interface BOMFormData {
  name: string
  type: string
  product_id: string
  unit_id: string
  additional_fixed_cost: string
  bom_details: {
    product_id: string
    unit_id: string
    quantity: string
    waste: string
  }[]
}

export default function BOMPage() {
  const { t } = useTranslation()
  const {
    data: bomsData,
    loading,
    deleteLoading,
    editLoading,
    keyword,
    setKeyword,
    type: typeFilter,
    setType: setTypeFilter,
    page,
    setPage,
    size,
    setSize,
    onAdd,
    onEdit,
    onDelete,
  } = useBOMs()
  
  const { data: productsData } = useProducts()
  const { data: measurementUnits } = useMeasurementUnitOptions()
  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BOMFormData>({
    name: "",
    type: "",
    product_id: "",
    unit_id: "",
    additional_fixed_cost: "",
    bom_details: [],
  })

  const boms = bomsData?.records || []
  const totalRecords = bomsData?.page_meta?.total || 0

  const handleAddBOM = () => {
    setEditingBOM(null)
    setFormData({
      name: "",
      type: "",
      product_id: "",
      unit_id: "",
      additional_fixed_cost: "",
      bom_details: [],
    })
    setIsSheetOpen(true)
  }

  const handleEditBOM = (bom: BOM) => {
    setEditingBOM(bom)
    setFormData({
      name: bom.name,
      type: bom.type,
      product_id: bom.product_id,
      unit_id: bom.unit_id,
      additional_fixed_cost: bom.additional_fixed_cost.toString(),
      bom_details: bom.bom_details?.map(detail => ({
        product_id: detail.product_id,
        unit_id: detail.unit_id,
        quantity: detail.quantity.toString(),
        waste: detail.waste.toString(),
      })) || [],
    })
    setIsSheetOpen(true)
  }

  const handleDeleteBOM = async (id: string) => {
    await onDelete(id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const bomData: BOMWithDetailsRequest = {
        company_id: "", // This will be set in the hook
        name: formData.name,
        type: formData.type,
        product_id: formData.product_id,
        unit_id: formData.unit_id,
        additional_fixed_cost: Number.parseFloat(formData.additional_fixed_cost) || 0,
        bom_details: formData.bom_details.map(detail => ({
          product_id: detail.product_id,
          unit_id: detail.unit_id,
          quantity: Number.parseFloat(detail.quantity) || 0,
          waste: Number.parseFloat(detail.waste) || 0,
        })),
      }

      if (editingBOM) {
        await onEdit(editingBOM.id, bomData)
      } else {
        await onAdd(bomData)
      }
      
      setIsSheetOpen(false)
      setFormData({
        name: "",
        type: "",
        product_id: "",
        unit_id: "",
        additional_fixed_cost: "",
        bom_details: [],
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addBOMDetail = () => {
    setFormData({
      ...formData,
      bom_details: [
        ...formData.bom_details,
        { product_id: "", unit_id: "", quantity: "", waste: "" },
      ],
    })
  }

  const removeBOMDetail = (index: number) => {
    setFormData({
      ...formData,
      bom_details: formData.bom_details.filter((_, i) => i !== index),
    })
  }

  const updateBOMDetail = (index: number, field: string, value: string) => {
    const updatedDetails = [...formData.bom_details]
    updatedDetails[index] = { ...updatedDetails[index], [field]: value }
    setFormData({ ...formData, bom_details: updatedDetails })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav items={[{ label: t.common.inventories, href: "/dashboard" }, { label: t.bom.title }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.bom.title}</h1>
          <p className="text-gray-600 mt-2">{t.bom.subtitle}</p>
        </div>
        <Button
          onClick={handleAddBOM}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.bom.addBomRecipe}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{t.bom.bomRecipeList}</h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.bom.searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.bom.name}</TableHead>
                <TableHead>{t.bom.type}</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Additional Fixed Cost</TableHead>
                <TableHead>Details Count</TableHead>
                <TableHead className="text-right">{t.bom.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span>Loading BOMs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : boms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No BOMs found
                  </TableCell>
                </TableRow>
              ) : (
                boms.map((bom: BOM) => {
                  const product = productsData?.records?.find(p => p.id === bom.product_id)
                  const unit = measurementUnits?.find(u => u.id === bom.unit_id)
                  
                  return (
                    <TableRow key={bom.id}>
                      <TableCell className="font-medium">{bom.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bom.type === "assembly" 
                              ? "bg-blue-100 text-blue-800" 
                              : bom.type === "disassembly"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {bom.type === 'assembly' 
                            ? t.bom.assembly 
                            : bom.type === 'disassembly'
                            ? t.bom.disassembly
                            : t.bom.menu}
                        </span>
                      </TableCell>
                      <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                      <TableCell>{unit ? `${unit.name} (${unit.symbol})` : 'Unknown Unit'}</TableCell>
                      <TableCell>${bom.additional_fixed_cost.toFixed(2)}</TableCell>
                      <TableCell>{bom.bom_details?.length || 0} items</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditBOM(bom)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBOM(bom.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalRecords > 0 && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {Math.ceil(totalRecords / size)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(Math.ceil(totalRecords / size), page + 1))}
                disabled={page === Math.ceil(totalRecords / size)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{editingBOM ? t.bom.editBomRecipe : t.bom.addNewBomRecipe}</SheetTitle>
            <SheetDescription>
              {editingBOM ? t.bom.updateBomRecipeInfo : t.bom.createNewBomRecipe}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.bom.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.bom.enterBomRecipeName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{t.bom.type}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as "assembly" | "disassembly" | "menu" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.bom.selectType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assembly">{t.bom.assembly}</SelectItem>
                  <SelectItem value="disassembly">{t.bom.disassembly}</SelectItem>
                  <SelectItem value="menu">{t.bom.menu}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_id">Product</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
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
              <Label htmlFor="unit_id">Unit</Label>
              <Select
                value={formData.unit_id}
                onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
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
              <Label htmlFor="additional_fixed_cost">Additional Fixed Cost</Label>
              <Input
                id="additional_fixed_cost"
                type="number"
                step="0.01"
                value={formData.additional_fixed_cost}
                onChange={(e) => setFormData({ ...formData, additional_fixed_cost: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>BOM Details</Label>
                <Button type="button" onClick={addBOMDetail} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Detail
                </Button>
              </div>
              {formData.bom_details.map((detail, index) => (
                <div key={index} className="border p-3 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Detail {index + 1}</span>
                    <Button type="button" onClick={() => removeBOMDetail(index)} size="sm" variant="outline">
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Product</Label>
                      <Select
                        value={detail.product_id}
                        onValueChange={(value) => updateBOMDetail(index, 'product_id', value)}
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
                    <div>
                      <Label>Unit</Label>
                      <Select
                        value={detail.unit_id}
                        onValueChange={(value) => updateBOMDetail(index, 'unit_id', value)}
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
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={detail.quantity}
                        onChange={(e) => updateBOMDetail(index, 'quantity', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Waste</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={detail.waste}
                        onChange={(e) => updateBOMDetail(index, 'waste', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{editingBOM ? "Updating..." : "Creating..."}</span>
                </div>
              ) : (
                editingBOM ? t.bom.updateBomRecipe : t.bom.createBomRecipe
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
