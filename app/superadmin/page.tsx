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
import { useTranslation } from "@/lib/hooks/use-translation";
import LanguageSelector from "@/components/language-selector";

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
  const { t } = useTranslation();
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
          title: t.common.error,
          message: t.superAdmin.errors.fetchCompanies,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: t.common.error,
        message: t.superAdmin.errors.errorFetchingCompanies,
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {t.superAdmin.title}
              </h1>
              <p className="text-gray-600">{t.superAdmin.welcomeBack}, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              {t.superAdmin.logout}
            </Button>
          </div>
        </div>

        {/* Create Company Button */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t.superAdmin.companyManagement.title}
            </CardTitle>
            <CardDescription>
              {t.superAdmin.companyManagement.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.superAdmin.companyManagement.createNew}
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
                  {t.superAdmin.allCompanies.title}
                </CardTitle>
                <CardDescription>
                  {t.superAdmin.allCompanies.description}
                </CardDescription>
              </div>
              <Button
                onClick={fetchCompanies}
                disabled={loadingCompanies}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingCompanies ? 'animate-spin' : ''}`} />
                {t.superAdmin.allCompanies.refresh}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">{t.superAdmin.allCompanies.loading}</span>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t.superAdmin.allCompanies.noCompanies}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.superAdmin.allCompanies.companyName}</TableHead>
                    <TableHead>{t.superAdmin.allCompanies.website}</TableHead>
                    <TableHead>{t.superAdmin.allCompanies.createdAt}</TableHead>
                    <TableHead>{t.superAdmin.allCompanies.updatedAt}</TableHead>
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
                          <span className="text-gray-400">{t.superAdmin.allCompanies.noWebsite}</span>
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