"use client";

import { useState, useEffect } from "react";
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
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { useUserSettings } from "@/lib/hooks/user-settings";
import { useAuth } from "@/lib/context/auth";
import useSWR from "swr";
import { fetcher } from "@/lib/utils/api";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  company_id?: string;
}

export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const {
    updateProfile,
    changePassword,
    updateProfileLoading,
    changePasswordLoading,
  } = useUserSettings();

  // Fetch full user profile
  const { data: userData } = useSWR<ApiResponse<UserProfile>>(
    authUser ? "/v1/users" : null,
    fetcher
  );

  const user = userData?.data;

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: "",
    name: "",
    email: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.username || !profileForm.name || !profileForm.email) {
      return;
    }

    await updateProfile({
      username: profileForm.username,
      name: profileForm.name,
      email: profileForm.email,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      return;
    }

    await changePassword({
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
    });

    // Clear form on success
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BreadcrumbNav items={[{ label: "Settings" }]} />

      <div>
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-600 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Profile */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Account Profile
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Update your personal information and preferences
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={updateProfileLoading}
              >
                {updateProfileLoading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Update Password */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Update Password
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Change your account password
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                />
                {passwordForm.newPassword &&
                  passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={
                  changePasswordLoading ||
                  passwordForm.newPassword !== passwordForm.confirmPassword ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword
                }
              >
                {changePasswordLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
