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
import { Label } from "@/components/saturasui/label";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import {
  MeasurementUnit,
  useMeasurementUnits,
} from "@/lib/hooks/measurement_units";

export default function MeasurementUnitsComponent() {
  const {
    data: unitsData,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  } = useMeasurementUnits();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);
  const [formData, setFormData] = useState({ name: "", symbol: "" }); // Changed from 'symbol' to 'label'

  const units = unitsData?.records || [];

  const handleAddUnit = () => {
    setEditingUnit(null);
    setFormData({ name: "", symbol: "" }); // Changed from 'symbol' to 'symbol'
    setIsSheetOpen(true);
  };

  const handleEditUnit = (unit: MeasurementUnit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name, symbol: unit.symbol }); // Changed from 'symbol' to 'label'
    setIsSheetOpen(true);
  };

  const handleDeleteUnit = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this measurement unit?")
    ) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      await onEdit({
        ...editingUnit,
        name: formData.name,
        symbol: formData.symbol,
      }); // Changed from 'symbol' to 'symbol'
    } else {
      await onAdd({ name: formData.name, symbol: formData.symbol }); // Changed from 'symbol' to 'symbol'
    }
    setIsSheetOpen(false);
    setFormData({ name: "", symbol: "" }); // Changed from 'symbol' to 'symbol'
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border-2 border-[#F2F1ED] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Measurement Units
        </h2>
        <Button
          onClick={handleAddUnit}
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Unit
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
          <Input
            placeholder="Search units..."
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
              <TableHead>Symbol</TableHead>
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
                    Loading measurement units...
                  </p>
                </TableCell>
              </TableRow>
            ) : units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <p className="text-xs text-gray-500">
                    No measurement units found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              units?.slice(0, 5).map((unit) => (
                <TableRow key={unit.id} className="h-10">
                  <TableCell className="font-medium text-xs">
                    {unit.name}
                  </TableCell>
                  <TableCell className="text-xs">{unit.symbol}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(unit.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleEditUnit(unit)}
                        disabled={editLoading}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handleDeleteUnit(unit.id)}
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
              {editingUnit
                ? "Edit Measurement Unit"
                : "Add New Measurement Unit"}
            </SheetTitle>
            <SheetDescription>
              {editingUnit
                ? "Update measurement unit information"
                : "Create a new measurement unit"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Unit Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter unit name (e.g., kilogram)"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="symbol" className="text-xs font-medium">
                Symbol
              </Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                placeholder="Enter symbol (e.g., kg)"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || editLoading}
            >
              {loading || editLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  {editingUnit ? "Updating..." : "Adding..."}
                </>
              ) : editingUnit ? (
                "Update Unit"
              ) : (
                "Add Unit"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
