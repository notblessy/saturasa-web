"use client";

import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import CategoriesComponent from "./categories";
import MeasurementUnitsComponent from "./measurement-units";

export default function ProductSettingsPage() {
  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Inventories", href: "/dashboard" },
          { label: "Product Settings" },
        ]}
      />

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your product categories and measurement units
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoriesComponent />
          <MeasurementUnitsComponent />
        </div>
      </div>
    </div>
  );
}
