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
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";
import LanguageSelector from "@/components/language-selector";

export default function DashboardPage() {
  const { t } = useTranslation();

  const stats = [
    {
      title: t.dashboard.stats.totalProducts,
      value: "1,234",
      change: "+12%",
      icon: Package,
      color: "from-purple-400 to-purple-600",
    },
    {
      title: t.dashboard.stats.activeProductions,
      value: "56",
      change: "+8%",
      icon: BarChart3,
      color: "from-pink-400 to-pink-600",
    },
    {
      title: t.dashboard.stats.suppliers,
      value: "89",
      change: "+3%",
      icon: Users,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: t.dashboard.stats.monthlyRevenue,
      value: "$45,678",
      change: "+15%",
      icon: TrendingUp,
      color: "from-green-400 to-green-600",
    },
  ];

  const recentActivities = [
    {
      action: t.dashboard.recentActivities.newProductAdded,
      item: "Premium Coffee Beans",
      time: `2 ${t.dashboard.recentActivities.timeAgo.hoursAgo}`,
    },
    {
      action: t.dashboard.recentActivities.productionCompleted,
      item: "Batch #1234",
      time: `4 ${t.dashboard.recentActivities.timeAgo.hoursAgo}`,
    },
    {
      action: t.dashboard.recentActivities.supplierUpdated,
      item: "ABC Supplies Co.",
      time: `6 ${t.dashboard.recentActivities.timeAgo.hoursAgo}`,
    },
    {
      action: t.dashboard.recentActivities.stockReplenished,
      item: "Packaging Materials",
      time: `8 ${t.dashboard.recentActivities.timeAgo.hoursAgo}`,
    },
  ];

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
                  <p className="text-base font-semibold text-gray-900 mb-0.5">
                    {stat.value}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`p-2 rounded bg-gradient-to-r ${stat.color} shrink-0 ml-2`}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-purple-600" />
              {t.dashboard.recentActivities.title}
            </CardTitle>
            <CardDescription>
              {t.dashboard.recentActivities.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-purple-50/30 hover:bg-purple-50/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {activity.item}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 shrink-0 ml-2">
                    {activity.time}
                  </p>
                </div>
              ))}
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
                className="h-auto p-3 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
              >
                <Package className="h-4 w-4 text-purple-600 mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.addProduct}
                </p>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4 text-blue-600 mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.newProduction}
                </p>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
              >
                <Users className="h-4 w-4 text-green-600 mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.addSupplier}
                </p>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-3 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 text-orange-600 mb-1.5" />
                <p className="text-xs font-medium text-gray-900">
                  {t.dashboard.quickActions.stockUpdate}
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
