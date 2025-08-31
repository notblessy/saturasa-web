"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/context/auth";
import api from "@/lib/utils/api";
import useToast from "@/lib/context/toast";
import { Building, Plus, RefreshCw } from "lucide-react";
import CreateCompanyModal from "@/components/create-company-modal";

interface Company {
  id: string;
  name: string;
  website: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

export default function SuperAdminPage() {
  const { user, onLogout } = useAuth();
  const toast = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await api.get("/v1/companies");
      if (response.data.success) {
        setCompanies(response.data.data || []);
      } else {
        toast({
          title: "Error",
          message: "Failed to fetch companies",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        message: "Error fetching companies",
        color: "red",
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleModalSuccess = () => {
    fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            Logout
          </Button>
        </div>

        {/* Create Company Button */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Management
            </CardTitle>
            <CardDescription>
              Manage companies and create new ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Company
            </Button>
          </CardContent>
        </Card>

        {/* Create Company Modal */}
        <CreateCompanyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  All Companies
                </CardTitle>
                <CardDescription>
                  View and manage all created companies
                </CardDescription>
              </div>
              <Button
                onClick={fetchCompanies}
                disabled={loadingCompanies}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingCompanies ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading companies...</span>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No companies found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {company.logo && (
                            <img
                              src={company.logo}
                              alt={`${company.name} logo`}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          {company.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {company.website}
                          </a>
                        ) : (
                          <span className="text-gray-400">No website</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(company.updated_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}