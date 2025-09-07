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
import { useTranslation } from "@/lib/hooks/use-translation"

interface MeasurementUnit {
  id: string
  name: string
  label: string
}

const mockUnits: MeasurementUnit[] = [
  { id: "1", name: "kilogram", label: "kg" },
  { id: "2", name: "gram", label: "g" },
  { id: "3", name: "liter", label: "L" },
  { id: "4", name: "milliliter", label: "mL" },
  { id: "5", name: "piece", label: "pcs" },
]

export default function MeasurementUnitsPage() {
  const { t } = useTranslation()
  const [units, setUnits] = useState<MeasurementUnit[]>(mockUnits)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null)
  const [formData, setFormData] = useState({ name: "", label: "" })

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUnit = () => {
    setEditingUnit(null)
    setFormData({ name: "", label: "" })
    setIsSheetOpen(true)
  }

  const handleEditUnit = (unit: MeasurementUnit) => {
    setEditingUnit(unit)
    setFormData({ name: unit.name, label: unit.label })
    setIsSheetOpen(true)
  }

  const handleDeleteUnit = (id: string) => {
    setUnits(units.filter((u) => u.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUnit) {
      setUnits(units.map((u) => (u.id === editingUnit.id ? { ...u, ...formData } : u)))
    } else {
      const newUnit: MeasurementUnit = {
        id: Date.now().toString(),
        ...formData,
      }
      setUnits([...units, newUnit])
    }
    setIsSheetOpen(false)
    setFormData({ name: "", label: "" })
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: "Product Settings", href: "/dashboard" },
          { label: t.measurementUnits.title },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.measurementUnits.title}</h1>
          <p className="text-gray-600 mt-2">{t.measurementUnits.subtitle}</p>
        </div>
        <Button
          onClick={handleAddUnit}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.measurementUnits.addUnit}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{t.measurementUnits.measurementUnitsList}</h2>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.measurementUnits.searchPlaceholder}
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
                <TableHead>{t.measurementUnits.name}</TableHead>
                <TableHead>{t.measurementUnits.label}</TableHead>
                <TableHead className="text-right">{t.measurementUnits.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.label}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditUnit(unit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.id)}
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
            <SheetTitle>{editingUnit ? t.measurementUnits.editMeasurementUnit : t.measurementUnits.addNewMeasurementUnit}</SheetTitle>
            <SheetDescription>
              {editingUnit ? t.measurementUnits.updateMeasurementUnitInfo : t.measurementUnits.createNewMeasurementUnit}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.measurementUnits.unitName}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.measurementUnits.enterUnitName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">{t.measurementUnits.unitLabel}</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder={t.measurementUnits.enterUnitLabel}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {editingUnit ? t.measurementUnits.updateUnit : t.measurementUnits.addUnit}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
