"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  ChevronRight,
  ChevronDown,
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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    parent_id: null as string | null,
    balance: 0,
  });

  const accounts = accountsData?.records || [];

  // Build tree structure from flat list
  interface TreeNode extends ChartOfAccount {
    children: TreeNode[];
  }

  const buildTree = (accounts: ChartOfAccount[]): TreeNode[] => {
    const accountMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // First pass: create all nodes
    accounts.forEach((account) => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // Second pass: build tree structure
    accounts.forEach((account) => {
      const node = accountMap.get(account.id)!;
      if (account.parent_id) {
        const parent = accountMap.get(account.parent_id);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found, treat as root
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // Sort by code
    const sortTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((node) => ({
          ...node,
          children: sortTree(node.children),
        }));
    };

    return sortTree(roots);
  };

  const treeData = useMemo(() => {
    return buildTree(accounts);
  }, [accounts]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          allNodeIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

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
    onQuery({ keyword: value });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    // Don't send "all" to the API, send empty string instead
    onQuery({ category: value === "all" ? "" : value });
  };

  // Recursive component to render tree nodes
  const TreeNode = ({
    node,
    level = 0,
  }: {
    node: TreeNode;
    level?: number;
  }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = level * 20;

    return (
      <div className="w-full">
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 border-b border-[#F2F1ED] transition-colors"
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="font-medium text-xs text-gray-900 min-w-[100px]">
              {node.code}
            </div>
            <div className="flex-1 text-xs text-gray-700 min-w-0 truncate">
              {node.name}
            </div>
            <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditAccount(node)}
                disabled={loading}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteAccount(node.id)}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
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
                <SelectItem value="all" className="text-xs">
                  All Categories
                </SelectItem>
                {ACCOUNT_CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat.value}
                    value={cat.value}
                    className="text-xs"
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="text-xs"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="text-xs"
            >
              Collapse All
            </Button>
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white shadow-sm">
          {/* Header */}
          <div className="bg-[#F8F8F6] border-b border-[#F2F1ED] px-3 py-2">
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
              <div className="w-5" />
              <div className="font-medium min-w-[100px]">Code</div>
              <div className="flex-1">Name</div>
              <div className="min-w-[80px] text-right">Actions</div>
            </div>
          </div>

          {/* Tree List */}
          <div className="divide-y divide-[#F2F1ED]">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <p className="mt-2 text-xs text-gray-500">
                  Loading accounts...
                </p>
              </div>
            ) : treeData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500">No accounts found</p>
              </div>
            ) : (
              treeData.map((node) => (
                <TreeNode key={node.id} node={node} level={0} />
              ))
            )}
          </div>
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
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-xs"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parent_id" className="text-xs font-medium">
                Parent Account
              </Label>
              <Select
                value={formData.parent_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value || null })
                }
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select parent account (optional)" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  <SelectItem value="" className="text-xs">
                    None (Top Level)
                  </SelectItem>
                  {accounts
                    .filter(
                      (acc) => !editingAccount || acc.id !== editingAccount.id
                    )
                    .map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id}
                        className="text-xs"
                      >
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select a parent account to create a child account
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="balance" className="text-xs font-medium">
                Balance
              </Label>
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
