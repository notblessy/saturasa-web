"use client";

import type React from "react";

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
import { Label } from "@/components/saturasui/label";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";

interface Category {
  id: string;
  name: string;
}

const mockCategories: Category[] = [
  { id: "1", name: "Beverages" },
  { id: "2", name: "Confectionery" },
  { id: "3", name: "Ingredients" },
  { id: "4", name: "Packaging" },
];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setIsSheetOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsSheetOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, name: formData.name } : c
        )
      );
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
      };
      setCategories([...categories, newCategory]);
    }
    setIsSheetOpen(false);
    setFormData({ name: "" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: "Product Settings", href: "/dashboard" },
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
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>{t.categories.name}</TableHead>
                <TableHead className="text-right">
                  {t.categories.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="h-10">
                  <TableCell className="font-medium text-xs">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
            <div className="space-y-2">
              <Label htmlFor="name">{t.categories.categoryName}</Label>
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
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
            >
              {editingCategory
                ? t.categories.updateCategory
                : t.categories.addCategory}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
