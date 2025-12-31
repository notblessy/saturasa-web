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
  FileText,
  Eye,
  RefreshCw,
  RotateCcw,
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDocumentTemplates,
  DocumentTemplate,
} from "@/lib/hooks/invoice-templates";
import { Badge } from "@/components/saturasui/badge";

const DOCUMENT_TYPES = [
  { value: "INVOICE", label: "Invoice" },
  { value: "PURCHASE_ORDER", label: "Purchase Order" },
  { value: "RECEIPT", label: "Receipt" },
  { value: "QUOTATION", label: "Quotation" },
  { value: "DELIVERY_NOTE", label: "Delivery Note" },
];

const RESET_POLICIES = [
  { value: "NONE", label: "None (Continuous)" },
  { value: "DAILY", label: "Daily" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const FORMAT_TOKENS = [
  {
    value: "{COMP}",
    label: "Company Code",
    description: "Company code or short name",
  },
  { value: "{TYPE}", label: "Document Type", description: "Document type" },
  { value: "{YYYY}", label: "Full Year", description: "e.g., 2025" },
  { value: "{YY}", label: "Short Year", description: "e.g., 25" },
  { value: "{MM}", label: "Month", description: "e.g., 01-12" },
  { value: "{DD}", label: "Day", description: "e.g., 01-31" },
  { value: "{####}", label: "4-Digit Sequence", description: "e.g., 0001" },
  {
    value: "{SEQ}",
    label: "Variable Sequence",
    description: "e.g., 1, 2, 3...",
  },
  { value: "{BRANCH}", label: "Branch Code", description: "Branch code" },
];

export default function DocumentTemplatesPage() {
  const {
    data: templatesData,
    loading,
    deleteLoading,
    editLoading,
    onQuery,
    onAdd,
    onEdit,
    onDelete,
    onGeneratePreview,
    onResetSequence,
  } = useDocumentTemplates();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState({
    document_type: "",
    format: "",
    last_number: 0,
    reset_policy: "NONE",
  });

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<DocumentTemplate | null>(null);
  const [previewData, setPreviewData] = useState({
    company_code: "COMP",
    branch_code: "HQ",
    issued_date: new Date().toISOString().split("T")[0],
  });
  const [previewResult, setPreviewResult] = useState("");

  const templates = templatesData?.records || [];

  const handleAddToken = (token: string) => {
    let newFormat = formData.format;

    // If format exists, add a dash separator before adding the new token
    if (newFormat && !newFormat.endsWith("-")) {
      newFormat += "-";
    }

    newFormat += token;
    setFormData({ ...formData, format: newFormat });
  };

  const handleRemoveToken = (indexToRemove: number) => {
    const parts = formData.format.split(/(\{[^}]+\}|-)/).filter(Boolean);
    parts.splice(indexToRemove, 1);

    // Clean up: remove consecutive dashes and leading/trailing dashes
    let cleaned = parts.join("");
    cleaned = cleaned.replace(/--+/g, "-");
    cleaned = cleaned.replace(/^-+/, "").replace(/-+$/, "");

    setFormData({ ...formData, format: cleaned });
  };

  const handleSetExample = () => {
    setFormData({ ...formData, format: "{COMP}-{TYPE}-{YYYY}-{MM}-{####}" });
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      document_type: "",
      format: "",
      last_number: 0,
      reset_policy: "NONE",
    });
    setIsSheetOpen(true);
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      document_type: template.document_type,
      format: template.format,
      last_number: template.last_number,
      reset_policy: template.reset_policy,
    });
    setIsSheetOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = editingTemplate
      ? await onEdit({ ...formData, id: editingTemplate.id })
      : await onAdd(formData);

    if (success) {
      setIsSheetOpen(false);
      setFormData({
        document_type: "",
        format: "",
        last_number: 0,
        reset_policy: "NONE",
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onQuery({ keyword: value, page: 1 });
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    onQuery({ document_type: value === "all" ? "" : value, page: 1 });
  };

  const handlePreview = (template: DocumentTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
    generatePreview(template);
  };

  const generatePreview = async (template: DocumentTemplate) => {
    if (!template) return;

    const result = await onGeneratePreview(template.id, previewData);
    if (result) {
      setPreviewResult(result.invoice_number);
    }
  };

  const handleResetSequence = async (id: string, templateName: string) => {
    if (
      window.confirm(
        `Are you sure you want to reset the sequence for ${templateName}? This will set the last number back to 0.`
      )
    ) {
      await onResetSequence(id);
    }
  };

  const getResetPolicyBadge = (policy: string) => {
    const colors: Record<string, string> = {
      NONE: "bg-gray-100 text-gray-800",
      DAILY: "bg-blue-100 text-blue-800",
      MONTHLY: "bg-green-100 text-green-800",
      YEARLY: "bg-primary/10 text-primary",
    };
    return colors[policy] || colors.NONE;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <BreadcrumbNav
        items={[
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Document Templates" },
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Document Templates
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage document numbering templates for invoices and other documents
          </p>
        </div>
        <Button
          onClick={handleAddTemplate}
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Template
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={typeFilter || "all"}
              onValueChange={handleTypeFilter}
            >
              <SelectTrigger className="h-8 text-xs border-[#F2F1ED] w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="border-[#F2F1ED]">
                <SelectItem value="all" className="text-xs">
                  All Types
                </SelectItem>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="text-xs"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-[#F2F1ED] rounded-md overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent h-10">
                <TableHead>Document Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Last Number</TableHead>
                <TableHead>Reset Policy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    <p className="mt-2 text-xs text-gray-500">
                      Loading templates...
                    </p>
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-xs text-gray-500">No templates found</p>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {template.document_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded font-mono">
                        {template.format}
                      </code>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-mono">{template.last_number}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getResetPolicyBadge(template.reset_policy)}
                      >
                        {template.reset_policy}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handlePreview(template)}
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() =>
                            handleResetSequence(
                              template.id,
                              template.document_type
                            )
                          }
                          title="Reset Sequence"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleEditTemplate(template)}
                          disabled={loading}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleDeleteTemplate(template.id)}
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

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle>
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </SheetTitle>
            <SheetDescription>
              {editingTemplate
                ? "Update the template information below"
                : "Fill in the information to create a new template"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label htmlFor="document_type" className="text-xs font-medium">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, document_type: value })
                }
                required
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-xs"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="format" className="text-xs font-medium">
                Format <span className="text-red-500">*</span>
              </Label>

              {/* Format Preview */}
              <div className="min-h-[42px] p-2 border border-[#F2F1ED] rounded-md bg-gray-50 flex flex-wrap gap-1 items-center">
                {formData.format ? (
                  formData.format
                    .split(/(\{[^}]+\}|-)/)
                    .filter(Boolean)
                    .map((part, index) => {
                      const token = FORMAT_TOKENS.find((t) => t.value === part);
                      if (token && part.startsWith("{")) {
                        return (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 pr-1"
                          >
                            <span>{token.label}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveToken(index)}
                              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      } else if (part === "-") {
                        return (
                          <span
                            key={index}
                            className="text-gray-400 font-bold px-1"
                          >
                            -
                          </span>
                        );
                      } else if (part.trim()) {
                        return (
                          <span key={index} className="text-sm px-1">
                            {part}
                          </span>
                        );
                      }
                      return null;
                    })
                ) : (
                  <span className="text-gray-400 text-sm">
                    Click tokens below to build your format
                  </span>
                )}
              </div>

              {/* Hidden Input for Form Submission */}
              <Input
                id="format"
                type="hidden"
                value={formData.format}
                required
              />

              {/* Token Selector */}
              <div className="space-y-2">
                <span className="text-xs text-gray-500">
                  Raw:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {formData.format || "empty"}
                  </code>
                </span>
                <div className="flex flex-wrap gap-2">
                  {FORMAT_TOKENS.map((token) => (
                    <Button
                      key={token.value}
                      type="button"
                      variant="outline"
                      onClick={() => handleAddToken(token.value)}
                      className="text-xs hover:bg-primary/5 hover:text-primary hover:border-primary/40"
                      title={token.description}
                    >
                      {token.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset_policy" className="text-xs font-medium">
                Reset Policy <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.reset_policy}
                onValueChange={(value) =>
                  setFormData({ ...formData, reset_policy: value })
                }
                required
              >
                <SelectTrigger className="h-8 text-xs border-[#F2F1ED]">
                  <SelectValue placeholder="Select reset policy" />
                </SelectTrigger>
                <SelectContent className="border-[#F2F1ED]">
                  {RESET_POLICIES.map((policy) => (
                    <SelectItem
                      key={policy.value}
                      value={policy.value}
                      className="text-xs"
                    >
                      {policy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Determines when the sequence number resets
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last_number" className="text-xs font-medium">
                Starting Number
              </Label>
              <Input
                id="last_number"
                type="number"
                value={formData.last_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    last_number: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                The sequence will start from this number
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
                ) : editingTemplate ? (
                  "Update Template"
                ) : (
                  "Add Template"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Document Number</DialogTitle>
            <DialogDescription>
              Customize the preview parameters to see how the document number
              will look
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="company_code" className="text-xs font-medium">
                Company Code
              </Label>
              <Input
                id="company_code"
                value={previewData.company_code}
                onChange={(e) =>
                  setPreviewData({
                    ...previewData,
                    company_code: e.target.value,
                  })
                }
                placeholder="e.g., SANCTUM"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch_code" className="text-xs font-medium">
                Branch Code
              </Label>
              <Input
                id="branch_code"
                value={previewData.branch_code}
                onChange={(e) =>
                  setPreviewData({
                    ...previewData,
                    branch_code: e.target.value,
                  })
                }
                placeholder="e.g., HQ"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="issued_date" className="text-xs font-medium">
                Issued Date
              </Label>
              <Input
                id="issued_date"
                type="date"
                value={previewData.issued_date}
                onChange={(e) =>
                  setPreviewData({
                    ...previewData,
                    issued_date: e.target.value,
                  })
                }
              />
            </div>

            <Button
              onClick={() =>
                previewTemplate && generatePreview(previewTemplate)
              }
              className="w-full bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Generate Preview
            </Button>

            {previewResult && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Preview Result:</p>
                <p className="text-xl font-mono font-bold text-primary">
                  {previewResult}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
