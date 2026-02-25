"use client";

import { useState } from "react";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import { Label } from "@/components/saturasui/label";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickCreateField {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

interface QuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fields: QuickCreateField[];
  onSubmit: (data: Record<string, string>) => Promise<boolean>;
}

export function QuickCreateDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
}: QuickCreateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        setFormData({});
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label className="text-xs font-medium">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </Label>
              <Input
                value={formData[field.name] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                placeholder={field.placeholder}
                required={field.required}
              />
            </div>
          ))}
          <div className="flex justify-end gap-1.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
