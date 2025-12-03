"use client";

import { useState } from "react";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/saturasui/table";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  DollarSign,
  Calculator,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/saturasui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useChartOfAccounts,
  ChartOfAccount,
} from "@/lib/hooks/chart-of-accounts";

const ACCOUNT_CATEGORIES = [
  { value: "ASSET", label: "Asset" },
  { value: "LIABILITY", label: "Liability" },
  { value: "EQUITY", label: "Equity" },
  { value: "REVENUE", label: "Revenue" },
  { value: "EXPENSE", label: "Expense" },
];

export default function ChartOfAccountsPage() {
  const {
    data: accountsData,
    loading,
    deleteLoading,
    editLoading,
    onQuery,
    onAdd,
    onEdit,
    onDelete,
  } = useChartOfAccounts();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(
    null
  );
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    parent_id: null as string | null,
    balance: 0,
  });

  const accounts = accountsData?.records || [];

  const handleAddAccount = () => {
    setEditingAccount(null);
    setFormData({
      code: "",
      name: "",
      category: "",
      parent_id: null,
      balance: 0,
    });
    setIsSheetOpen(true);
  };

  const handleEditAccount = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      category: account.category,
      parent_id: account.parent_id || null,
      balance: account.balance || 0,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = editingAccount
      ? await onEdit({ ...formData, id: editingAccount.id })
      : await onAdd(formData);

    if (success) {
      setIsSheetOpen(false);
      setFormData({
        code: "",
        name: "",
        category: "",
        parent_id: null,
        balance: 0,
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    // Don't send "all" to the API, send empty string instead
    onQuery({ category: value === "all" ? "" : value, page: 1 });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Chart of Accounts" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Chart of Accounts
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage your company's chart of accounts and financial structure
          </p>
        </div>
        <Button
          onClick={handleAddAccount}
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Account
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter || "all"}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="h-8 text-xs border-[#F2F1ED] w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="border-[#F2F1ED]">
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                {ACCOUNT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-xs">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="mt-2 text-xs text-gray-500">Loading accounts...</p>
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-xs text-gray-500">No accounts found</p>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium text-xs">
                      {account.code}
                    </TableCell>
                    <TableCell className="text-xs">
                      {account.parent_id && (
                        <span className="text-gray-400 mr-2">└─</span>
                      )}
                      {account.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                        {account.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(account.balance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleEditAccount(account)}
                          disabled={loading}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle>
              {editingAccount ? "Edit Account" : "Add New Account"}
            </SheetTitle>
            <SheetDescription>
              {editingAccount
                ? "Update the account information below"
                : "Fill in the information to create a new account"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-medium">
                Account Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., 1-10001"
                required
              />
              <p className="text-xs text-gray-500">
                Enter a unique account code (e.g., 1-10001)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Account Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Kas di Bank - BCA"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {ACCOUNT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-xs">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="balance" className="text-xs font-medium">Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    balance: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">
                Initial account balance (optional)
              </p>
            </div>

            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsSheetOpen(false)}
                disabled={loading || editLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={loading || editLoading}
              >
                {loading || editLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : editingAccount ? (
                  "Update Account"
                ) : (
                  "Add Account"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
