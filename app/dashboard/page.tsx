"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, AlertCircle } from "lucide-react"
import { useTranslation } from "@/lib/hooks/use-translation"
import LanguageSelector from "@/components/language-selector"

export default function DashboardPage() {
  const { t } = useTranslation()
  
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
  ]

  const recentActivities = [
    { action: t.dashboard.recentActivities.newProductAdded, item: "Premium Coffee Beans", time: `2 ${t.dashboard.recentActivities.timeAgo.hoursAgo}` },
    { action: t.dashboard.recentActivities.productionCompleted, item: "Batch #1234", time: `4 ${t.dashboard.recentActivities.timeAgo.hoursAgo}` },
    { action: t.dashboard.recentActivities.supplierUpdated, item: "ABC Supplies Co.", time: `6 ${t.dashboard.recentActivities.timeAgo.hoursAgo}` },
    { action: t.dashboard.recentActivities.stockReplenished, item: "Packaging Materials", time: `8 ${t.dashboard.recentActivities.timeAgo.hoursAgo}` },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.title}</h1>
          <p className="text-gray-600 mt-2">{t.dashboard.subtitle}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              {t.dashboard.recentActivities.title}
            </CardTitle>
            <CardDescription>{t.dashboard.recentActivities.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                  </div>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{t.dashboard.quickActions.title}</CardTitle>
            <CardDescription>{t.dashboard.quickActions.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-colors">
                <Package className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium">{t.dashboard.quickActions.addProduct}</p>
              </button>
              <button className="p-4 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium">{t.dashboard.quickActions.newProduction}</p>
              </button>
              <button className="p-4 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 transition-colors">
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm font-medium">{t.dashboard.quickActions.addSupplier}</p>
              </button>
              <button className="p-4 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 transition-colors">
                <ShoppingCart className="h-6 w-6 text-orange-600 mb-2" />
                <p className="text-sm font-medium">{t.dashboard.quickActions.stockUpdate}</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
