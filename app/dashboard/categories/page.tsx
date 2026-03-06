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
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";
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

export default function CategoriesPage() {
  const { t } = useTranslation();
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
  // The API returns page_summary but the global type declares page_meta
  const pageSummary = (categoriesData as any)?.page_summary as
    | { total: number; page: number; size: number; hasNext: boolean }
    | undefined;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: t.productSettings.title, href: "/dashboard/product-settings" },
          { label: t.categories.title },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {t.categories.title}
          </h1>
          <p className="text-xs text-gray-600 mt-1">{t.categories.subtitle}</p>
        </div>
        <Button
          onClick={handleAddCategory}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          {t.categories.addCategory}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <Input
              placeholder={t.categories.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>{t.categories.name}</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">
                  {t.categories.actions}
                </TableHead>
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
                categories.map((category) => (
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

        {/* Pagination */}
        {pageSummary && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Showing {categories.length} of {pageSummary.total} categories
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: pageSummary.page - 1 })}
                disabled={pageSummary.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => onQuery({ page: pageSummary.page + 1 })}
                disabled={!pageSummary.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingCategory
                ? t.categories.editCategory
                : t.categories.addNewCategory}
            </SheetTitle>
            <SheetDescription>
              {editingCategory
                ? t.categories.updateCategoryInfo
                : t.categories.createNewCategory}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                {t.categories.categoryName}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t.categories.enterCategoryName}
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
                t.categories.updateCategory
              ) : (
                t.categories.addCategory
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
