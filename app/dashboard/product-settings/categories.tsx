"use client";

import { useState } from "react";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/saturasui/label";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useCategories, useCategoryOptions } from "@/lib/hooks/categories";

interface Category {
  id: string;
  slug: string;
  company_id: string;
  parent_id?: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  parent?: Category | null;
  children?: Category[];
}

export default function CategoriesComponent() {
  const {
    data: categoriesData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  } = useCategories();

  const { data: categoryOptions } = useCategoryOptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", parent_id: "" });

  const categories = categoriesData?.records || [];

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "", parent_id: "" });
    setIsSheetOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, parent_id: category.parent_id || "" });
    setIsSheetOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData = {
      name: formData.name,
      parent_id: formData.parent_id || null,
    };

    if (editingCategory) {
      await onEdit({ ...editingCategory, ...categoryData });
    } else {
      await onAdd(categoryData);
    }
    setIsSheetOpen(false);
    setFormData({ name: "", parent_id: "" });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border-2 border-[#F2F1ED] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Categories</h2>
        <Button
          onClick={handleAddCategory}
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Category
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent h-10">
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  <p className="mt-2 text-xs text-gray-500">
                    Loading categories...
                  </p>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <p className="text-xs text-gray-500">No categories found</p>
                </TableCell>
              </TableRow>
            ) : (
              categories.slice(0, 5).map((category) => (
                <TableRow key={category.id} className="h-10">
                  <TableCell className="font-medium text-xs">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-xs">
                    {category.parent?.name || "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleEditCategory(category)}
                        disabled={editLoading}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </SheetTitle>
            <SheetDescription>
              {editingCategory
                ? "Update category information"
                : "Create a new category"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Category Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parent" className="text-xs font-medium">
                Parent Category (Optional)
              </Label>
              <Select
                value={formData?.parent_id}
                onValueChange={(value) => {
                  if (value === "no_parent") {
                    setFormData({ ...formData, parent_id: "" });
                  } else {
                    setFormData({ ...formData, parent_id: value });
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  <SelectItem value="no_parent" className="text-xs">
                    No Parent
                  </SelectItem>
                  {categoryOptions
                    ?.filter((cat) => cat.id !== editingCategory?.id)
                    ?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="text-xs"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || editLoading}
            >
              {loading || editLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  {editingCategory ? "Updating..." : "Adding..."}
                </>
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Add Category"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
