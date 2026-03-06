"use client";

import Link from "next/link";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import {
  TrendingUp,
  ArrowLeftRight,
  CreditCard,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";

const reports = [
  {
    title: "Inventory Valuation",
    description: "View stock quantities and values across branches",
    icon: TrendingUp,
    href: "/dashboard/reports/inventory-valuation",
  },
  {
    title: "Stock Movements",
    description: "Track stock in/out movements with date filters",
    icon: ArrowLeftRight,
    href: "/dashboard/reports/stock-movements",
  },
  {
    title: "Purchase Summary",
    description: "Purchase analytics by status and supplier",
    icon: CreditCard,
    href: "/dashboard/reports/purchase-summary",
  },
  {
    title: "Production Summary",
    description: "Production analytics by status and BOM",
    icon: Activity,
    href: "/dashboard/reports/production-summary",
  },
];

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav items={[{ label: "Reports" }]} />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
        <p className="text-xs text-gray-600 mt-1">
          View analytics and reports for your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <report.icon className="h-4 w-4 text-primary" />
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
