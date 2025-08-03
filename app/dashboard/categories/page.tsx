"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Plus, Edit, Trash2, Search } from "lucide-react"

interface Category {
  id: string
  name: string
}

const mockCategories: Category[] = [
  { id: "1", name: "Beverages" },
  { id: "2", name: "Confectionery" },
  { id: "3", name: "Ingredients" },
  { id: "4", name: "Packaging" },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "" })

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({ name: "" })
    setIsSheetOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setIsSheetOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...c, name: formData.name } : c)))
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
      }
      setCategories([...categories, newCategory])
    }
    setIsSheetOpen(false)
    setFormData({ name: "" })
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Inventories", href: "/dashboard" },
          { label: "Product Settings", href: "/dashboard" },
          { label: "Categories" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Manage product categories</p>
        </div>
        <Button
          onClick={handleAddCategory}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Category List</h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
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
            <SheetTitle>{editingCategory ? "Edit Category" : "Add New Category"}</SheetTitle>
            <SheetDescription>
              {editingCategory ? "Update category information" : "Create a new category"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {editingCategory ? "Update Category" : "Add Category"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
