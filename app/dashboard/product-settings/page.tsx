"use client";

import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { useTranslation } from "@/lib/hooks/use-translation";
import CategoriesComponent from "./categories";
import MeasurementUnitsComponent from "./measurement-units";

export default function ProductSettingsPage() {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: t.productSettings.title },
        ]}
      />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">{t.productSettings.title}</h1>
        <p className="text-xs text-gray-600 mt-1">
          {t.productSettings.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoriesComponent />
        <MeasurementUnitsComponent />
      </div>
    </div>
  );
}
