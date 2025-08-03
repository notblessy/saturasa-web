"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Plus, Edit, Trash2, Search } from "lucide-react"

interface BOM {
  id: string
  name: string
  type: "assembly" | "menu"
  linkedProductSpec: string
  totalCost: number
  notes: string
}

const mockBOMs: BOM[] = [
  {
    id: "1",
    name: "Premium Coffee Blend Recipe",
    type: "menu",
    linkedProductSpec: "Premium Coffee Beans - 1kg",
    totalCost: 45.5,
    notes: "Special blend for premium customers",
  },
  {
    id: "2",
    name: "Gift Box Assembly",
    type: "assembly",
    linkedProductSpec: "Gift Box Set - 1pcs",
    totalCost: 25.99,
    notes: "Includes packaging and ribbon",
  },
]

const mockProductSpecs = [
  "Premium Coffee Beans - 1kg",
  "Organic Tea Leaves - 500g",
  "Gift Box Set - 1pcs",
  "Chocolate Bars - 100g",
]

export default function BOMPage() {
  const [boms, setBOMs] = useState<BOM[]>(mockBOMs)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "assembly" | "menu" | "",
    linkedProductSpec: "",
    totalCost: "",
    notes: "",
  })

  const filteredBOMs = boms.filter((bom) => bom.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddBOM = () => {
    setEditingBOM(null)
    setFormData({ name: "", type: "", linkedProductSpec: "", totalCost: "", notes: "" })
    setIsSheetOpen(true)
  }

  const handleEditBOM = (bom: BOM) => {
    setEditingBOM(bom)
    setFormData({
      name: bom.name,
      type: bom.type,
      linkedProductSpec: bom.linkedProductSpec,
      totalCost: bom.totalCost.toString(),
      notes: bom.notes,
    })
    setIsSheetOpen(true)
  }

  const handleDeleteBOM = (id: string) => {
    setBOMs(boms.filter((b) => b.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBOM) {
      setBOMs(
        boms.map((b) =>
          b.id === editingBOM.id
            ? {
                ...b,
                ...formData,
                type: formData.type as "assembly" | "menu",
                totalCost: Number.parseFloat(formData.totalCost),
              }
            : b,
        ),
      )
    } else {
      const newBOM: BOM = {
        id: Date.now().toString(),
        ...formData,
        type: formData.type as "assembly" | "menu",
        totalCost: Number.parseFloat(formData.totalCost),
      }
      setBOMs([...boms, newBOM])
    }
    setIsSheetOpen(false)
    setFormData({ name: "", type: "", linkedProductSpec: "", totalCost: "", notes: "" })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav items={[{ label: "Inventories", href: "/dashboard" }, { label: "BOM/Recipes" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BOM/Recipes</h1>
          <p className="text-gray-600 mt-2">Manage bill of materials and recipes</p>
        </div>
        <Button
          onClick={handleAddBOM}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add BOM/Recipe
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">BOM/Recipe List</h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search BOM/Recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Linked Product</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBOMs.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">{bom.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bom.type === "assembly" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {bom.type}
                    </span>
                  </TableCell>
                  <TableCell>{bom.linkedProductSpec}</TableCell>
                  <TableCell>${bom.totalCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditBOM(bom)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBOM(bom.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{editingBOM ? "Edit BOM/Recipe" : "Add New BOM/Recipe"}</SheetTitle>
            <SheetDescription>
              {editingBOM ? "Update BOM/Recipe information" : "Create a new BOM/Recipe entry"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter BOM/Recipe name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as "assembly" | "menu" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assembly">Assembly</SelectItem>
                  <SelectItem value="menu">Menu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedProductSpec">Linked Product Specification</Label>
              <Select
                value={formData.linkedProductSpec}
                onValueChange={(value) => setFormData({ ...formData, linkedProductSpec: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product specification" />
                </SelectTrigger>
                <SelectContent>
                  {mockProductSpecs.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost</Label>
              <Input
                id="totalCost"
                type="number"
                step="0.01"
                value={formData.totalCost}
                onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter additional notes"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {editingBOM ? "Update BOM/Recipe" : "Add BOM/Recipe"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
