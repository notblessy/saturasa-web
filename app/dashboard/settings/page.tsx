"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import {
  User,
  Bell,
  Shield,
  Database,
  DollarSign,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav items={[{ label: "Settings" }]} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart of Accounts */}
        <Card
          className="border-0 shadow-lg bg-primary/5 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => router.push("/dashboard/settings/chart-of-accounts")}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Chart of Accounts
              </span>
              <ArrowRight className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>
              Manage your company's financial accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Configure and organize your chart of accounts for better financial
              management and reporting.
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/dashboard/settings/chart-of-accounts");
              }}
              className="w-full mt-4 bg-primary hover:bg-primary/90"
            >
              Manage Accounts
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Templates */}
        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => router.push("/dashboard/settings/invoice-templates")}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Invoice Templates
              </span>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </CardTitle>
            <CardDescription>
              Configure document numbering templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Set up and manage invoice numbering templates for automated
              document generation with custom formats.
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/dashboard/settings/invoice-templates");
              }}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Manage Templates
            </Button>
          </CardContent>
        </Card>
        {/* User Settings */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              User Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="john.doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john.doe@epicsales.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue="John Doe" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Production Alerts</Label>
                <p className="text-sm text-gray-600">
                  Get notified about production issues
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stock Warnings</Label>
                <p className="text-sm text-gray-600">
                  Receive alerts when stock is low
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Updates</Label>
                <p className="text-sm text-gray-600">
                  Get notified about system updates
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your password and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              System Settings
            </CardTitle>
            <CardDescription>Configure system-wide preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="saturasa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="UTC-5 (Eastern Time)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="USD" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Enable maintenance mode</p>
              </div>
              <Switch />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Save System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
