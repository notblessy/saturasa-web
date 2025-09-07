"use client";

import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { useTranslation } from "@/lib/hooks/use-translation";
import CategoriesComponent from "./categories";
import MeasurementUnitsComponent from "./measurement-units";

export default function ProductSettingsPage() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: t.common.inventories, href: "/dashboard" },
          { label: t.productSettings.title },
        ]}
      />

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.productSettings.title}</h1>
          <p className="text-gray-600 mt-2">
            {t.productSettings.subtitle}
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
