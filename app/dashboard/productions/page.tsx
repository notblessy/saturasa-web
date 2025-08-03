"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Plus, Edit, Trash2, Search } from "lucide-react"

interface Production {
  id: string
  bomName: string
  quantity: number
  status: "pending" | "in-progress" | "completed" | "cancelled"
  createdDate: string
}

const mockProductions: Production[] = [
  {
    id: "1",
    bomName: "Premium Coffee Blend Recipe",
    quantity: 100,
    status: "completed",
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    bomName: "Gift Box Assembly",
    quantity: 50,
    status: "in-progress",
    createdDate: "2024-01-16",
  },
]

const mockBOMs = ["Premium Coffee Blend Recipe", "Gift Box Assembly", "Chocolate Bar Recipe", "Tea Blend Assembly"]

export default function ProductionsPage() {
  const [productions, setProductions] = useState<Production[]>(mockProductions)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingProduction, setEditingProduction] = useState<Production | null>(null)
  const [formData, setFormData] = useState({
    bomName: "",
    quantity: "",
    status: "" as "pending" | "in-progress" | "completed" | "cancelled" | "",
  })

  const filteredProductions = productions.filter((production) =>
    production.bomName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduction = () => {
    setEditingProduction(null)
    setFormData({ bomName: "", quantity: "", status: "" })
    setIsSheetOpen(true)
  }

  const handleEditProduction = (production: Production) => {
    setEditingProduction(production)
    setFormData({
      bomName: production.bomName,
      quantity: production.quantity.toString(),
      status: production.status,
    })
    setIsSheetOpen(true)
  }

  const handleDeleteProduction = (id: string) => {
    setProductions(productions.filter((p) => p.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProduction) {
      setProductions(
        productions.map((p) =>
          p.id === editingProduction.id
            ? {
                ...p,
                bomName: formData.bomName,
                quantity: Number.parseInt(formData.quantity),
                status: formData.status as "pending" | "in-progress" | "completed" | "cancelled",
              }
            : p,
        ),
      )
    } else {
      const newProduction: Production = {
        id: Date.now().toString(),
        bomName: formData.bomName,
        quantity: Number.parseInt(formData.quantity),
        status: formData.status as "pending" | "in-progress" | "completed" | "cancelled",
        createdDate: new Date().toISOString().split("T")[0],
      }
      setProductions([...productions, newProduction])
    }
    setIsSheetOpen(false)
    setFormData({ bomName: "", quantity: "", status: "" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav items={[{ label: "Inventories", href: "/dashboard" }, { label: "Productions" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productions</h1>
          <p className="text-gray-600 mt-2">Manage production orders</p>
        </div>
        <Button
          onClick={handleAddProduction}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Production
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Production List</h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search productions..."
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
                <TableHead>BOM/Recipe</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductions.map((production) => (
                <TableRow key={production.id}>
                  <TableCell className="font-medium">{production.bomName}</TableCell>
                  <TableCell>{production.quantity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(production.status)}`}>
                      {production.status}
                    </span>
                  </TableCell>
                  <TableCell>{production.createdDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduction(production)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduction(production.id)}
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
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingProduction ? "Edit Production" : "Add New Production"}</SheetTitle>
            <SheetDescription>
              {editingProduction ? "Update production information" : "Create a new production order"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="bomName">BOM/Recipe</Label>
              <Select value={formData.bomName} onValueChange={(value) => setFormData({ ...formData, bomName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select BOM/Recipe" />
                </SelectTrigger>
                <SelectContent>
                  {mockBOMs.map((bom) => (
                    <SelectItem key={bom} value={bom}>
                      {bom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Enter quantity"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "pending" | "in-progress" | "completed" | "cancelled" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {editingProduction ? "Update Production" : "Add Production"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
