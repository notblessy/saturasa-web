import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";

export interface DocumentTemplate {
  id: string;
  company_id: string;
  document_type: string;
  format: string;
  last_number: number;
  reset_policy: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface GenerateDocumentNumberRequest {
  company_code: string;
  branch_code: string;
  issued_date: string;
}

export interface GenerateDocumentNumberResponse {
  invoice_number: string;
  next_sequence: number;
}

export const useDocumentTemplates = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("document_type");
  const [keyword, setKeyword] = useState("");
  const [documentType, setDocumentType] = useState("");

  const pathKey = `v1/document-templates?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&keyword=${keyword}&document_type=${documentType}`;
  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<DocumentTemplate>>
  >(pathKey, fetcher, {});

  const onAdd = useCallback(
    async (data: Partial<DocumentTemplate>) => {
      setLoading(true);
      try {
        data.company_id = user?.company_id;
        const { data: res } = await api.post("v1/document-templates", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Document Template added successfully",
            color: "orange",
          });
          return true;
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  const onQuery = useCallback(
    (props: Record<string, any>) => {
      for (const [key, value] of Object.entries(props)) {
        if (key === "page") {
          setPage(value);
        } else if (key === "size") {
          setSize(value);
        } else if (key === "sort") {
          setSort(value);
        } else if (key === "keyword") {
          setKeyword(value);
        } else if (key === "document_type") {
          setDocumentType(value);
        }
      }
    },
    [setPage, setSize, setSort, setKeyword, setDocumentType]
  );

  const onEdit = useCallback(
    async (template: Partial<DocumentTemplate>) => {
      try {
        setEditLoading(true);

        template.company_id = user?.company_id as string;

        const { data: res } = await api.put(
          "v1/document-templates/" + template.id,
          template
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Document Template updated successfully",
            color: "orange",
          });
          return true;
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          message:
            error instanceof Error ? error.message : "Something went wrong",
          color: "red",
        });
        return false;
      } finally {
        setEditLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  const onDelete = useCallback(
    async (id: string) => {
      try {
        setDeleteLoading(true);

        const { data: res } = await api.delete(
          `/v1/document-templates/${id}?company_id=${user?.company_id}`
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Document Template deleted successfully",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message || "Something went wrong",
            color: "red",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
      } finally {
        setDeleteLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  const onGeneratePreview = useCallback(
    async (id: string, request: GenerateDocumentNumberRequest) => {
      try {
        const { data: res } = await api.post(
          `v1/document-templates/${id}/generate`,
          request
        );

        if (res.success) {
          return res.data;
        } else {
          toast({
            title: "Error",
            message: res.message || "Failed to generate preview",
            color: "red",
          });
          return null;
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Failed to generate preview",
          color: "red",
        });
        return null;
      }
    },
    [toast]
  );

  const onIncrementSequence = useCallback(
    async (id: string) => {
      try {
        const { data: res } = await api.post(
          `v1/document-templates/${id}/increment`,
          {}
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Sequence incremented successfully",
            color: "orange",
          });
          return true;
        } else {
          toast({
            title: "Error",
            message: res.message || "Failed to increment sequence",
            color: "red",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Failed to increment sequence",
          color: "red",
        });
        return false;
      }
    },
    [pathKey, toast]
  );

  const onResetSequence = useCallback(
    async (id: string) => {
      try {
        const { data: res } = await api.post(
          `v1/document-templates/${id}/reset`,
          {}
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Sequence reset successfully",
            color: "orange",
          });
          return true;
        } else {
          toast({
            title: "Error",
            message: res.message || "Failed to reset sequence",
            color: "red",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Failed to reset sequence",
          color: "red",
        });
        return false;
      }
    },
    [pathKey, toast]
  );

  return {
    data: data?.data || {
      records: [],
      page_meta: { total: 0, page: 1, size: 10 },
    },
    error,
    isValidating,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
    onGeneratePreview,
    onIncrementSequence,
    onResetSequence,
  };
};

export const useDocumentTemplateOptions = () => {
  const { data, error, isValidating } = useSWR<ApiResponse<DocumentTemplate[]>>(
    `v1/document-templates/options`,
    fetcher
  );

  return {
    data: data?.data ? data?.data : [],
    loading: (!error && !data) || isValidating,
  };
};
