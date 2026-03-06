"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import { Button } from "@/components/saturasui/button";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";
import LanguageSelector from "@/components/language-selector";
import { useDashboardSummary } from "@/lib/hooks/dashboard";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data: summary, loading } = useDashboardSummary();
  const router = useRouter();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const stats = [
    {
      title: t.dashboard.stats.totalProducts,
      value: summary ? formatNumber(summary.total_products) : "—",
      icon: Package,
      color: "bg-[#BF3A5D]",
    },
    {
      title: t.dashboard.stats.activeProductions,
      value: summary ? formatNumber(summary.active_productions) : "—",
      icon: BarChart3,
      color: "bg-[#11B9A6]",
    },
    {
      title: t.dashboard.stats.suppliers,
      value: summary ? formatNumber(summary.total_suppliers) : "—",
      icon: Users,
      color: "bg-[#28401C]",
    },
    {
      title: t.dashboard.stats.monthlyRevenue,
      value: summary ? formatCurrency(summary.inventory_value) : "—",
      icon: TrendingUp,
      color: "bg-[#F1BB1B]",
    },
  ];

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {t.dashboard.title}
          </h1>
          <p className="text-xs text-gray-600 mt-1">{t.dashboard.subtitle}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  {loading ? (
                    <Skeleton className="h-6 w-20 mb-0.5" />
                  ) : (
                    <p className="text-base font-semibold text-gray-900 mb-0.5">
                      {stat.value}
                    </p>
                  )}
                </div>
                <div
                  className={`p-2 rounded ${stat.color} shrink-0 ml-2`}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-primary" />
              {t.dashboard.recentActivities.title}
            </CardTitle>
            <CardDescription>
              {t.dashboard.recentActivities.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : summary?.recent_activities &&
                summary.recent_activities.length > 0 ? (
                summary.recent_activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {activity.type === "in" ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900">
                          Stock {activity.type === "in" ? "In" : "Out"}:{" "}
                          {activity.product_name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {activity.amount} — {activity.branch_name}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 shrink-0 ml-2">
                      {timeAgo(activity.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">
                  No recent activities
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.quickActions.title}</CardTitle>
            <CardDescription>
              {t.dashboard.quickActions.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors"
                onClick={() => router.push("/dashboard/products/new")}
              >
                <Package className="h-4 w-4 text-primary mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.addProduct}
                </p>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center justify-center bg-[#11B9A6]/10 hover:bg-[#11B9A6]/20 transition-colors"
                onClick={() => router.push("/dashboard/productions")}
              >
                <BarChart3 className="h-4 w-4 text-[#11B9A6] mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.newProduction}
                </p>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center justify-center bg-[#28401C]/10 hover:bg-[#28401C]/20 transition-colors"
                onClick={() => router.push("/dashboard/suppliers")}
              >
                <Users className="h-4 w-4 text-[#28401C] mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.addSupplier}
                </p>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center justify-center bg-[#D87827]/10 hover:bg-[#D87827]/20 transition-colors"
                onClick={() => router.push("/dashboard/inventories")}
              >
                <ShoppingCart className="h-4 w-4 text-[#D87827] mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.stockUpdate}
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Status Breakdown */}
      {summary?.purchase_status_breakdown &&
        Object.keys(summary.purchase_status_breakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                Purchase Invoice Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(summary.purchase_status_breakdown).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 border border-gray-100"
                    >
                      <span className="text-xs font-medium text-gray-600 capitalize">
                        {status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
