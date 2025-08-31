"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/utils/api";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Building } from "lucide-react";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCompanyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCompanyModalProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    logo: "",
    admin: {
      name: "",
      email: "",
      password: "",
      username: "",
      avatar: "",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("admin.")) {
      const adminField = field.replace("admin.", "");
      setFormData((prev) => ({
        ...prev,
        admin: {
          ...prev.admin,
          [adminField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/v1/auth/companies", formData);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Company created successfully!",
        });

        // Reset form
        setFormData({
          name: "",
          website: "",
          logo: "",
          admin: {
            name: "",
            email: "",
            password: "",
            username: "",
            avatar: "",
          },
        });

        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to create company",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating the company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Create New Company
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new company and its admin user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateCompany} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter company name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logo}
                onChange={(e) => handleInputChange("logo", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Admin User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Admin User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_name">Admin Name *</Label>
                <Input
                  id="admin_name"
                  type="text"
                  placeholder="Enter admin name"
                  value={formData.admin.name}
                  onChange={(e) => handleInputChange("admin.name", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_email">Admin Email *</Label>
                <Input
                  id="admin_email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.admin.email}
                  onChange={(e) => handleInputChange("admin.email", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_username">Admin Username *</Label>
                <Input
                  id="admin_username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.admin.username}
                  onChange={(e) => handleInputChange("admin.username", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_password">Admin Password *</Label>
                <div className="relative">
                  <Input
                    id="admin_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.admin.password}
                    onChange={(e) => handleInputChange("admin.password", e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_avatar">Admin Avatar URL</Label>
              <Input
                id="admin_avatar"
                type="url"
                placeholder="https://example.com/avatar.png"
                value={formData.admin.avatar}
                onChange={(e) => handleInputChange("admin.avatar", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}