import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";

interface Supplier {
  id: string;
  slug: string;
  company_id: string;
  name: string;
  contact_name: string;
  contact_number: string;
  address: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface WithPagingResponse<T> {
  records: T[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export const useSuppliers = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");

  const pathKey = `v1/suppliers?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&keyword=${keyword}`;
  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<Supplier>>
  >(
    pathKey as string,
    fetcher as (
      url: string
    ) => Promise<ApiResponse<WithPagingResponse<Supplier>>>,
    {}
  );

  const onAdd = useCallback(
    async (data: Partial<Supplier>) => {
      setLoading(true);
      try {
        data.company_id = user?.company_id as string;

        const { data: res } = await api.post("v1/suppliers", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success add supplier",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message,
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
        setLoading(false);
      }
    },
    [pathKey, toast]
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
        }
      }
    },
    [setPage, setSize, setSort, setKeyword]
  );

  const onEdit = useCallback(
    async (supplier: Supplier) => {
      try {
        setEditLoading(true);

        supplier.company_id = user?.company_id as string;

        const { data: res } = await api.put(
          "v1/suppliers/" + supplier.id,
          supplier
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success update supplier",
            color: "orange",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          message:
            error instanceof Error ? error.message : "Something went wrong",
          color: "red",
        });
      } finally {
        setEditLoading(false);
      }
    },
    [pathKey, toast]
  );

  const onDelete = useCallback(
    async (id: string) => {
      try {
        setDeleteLoading(true);

        const { data: res } = await api.delete(
          `/v1/suppliers/${id}?company_id=${user?.company_id}`
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success delete supplier",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: "Something went wrong",
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

  return {
    data: data?.data
      ? {
          records: data.data.records,
          total: data.data.page_summary.total,
          page: data.data.page_summary.page,
          size: data.data.page_summary.size,
        }
      : undefined,
    error,
    isValidating,
    loading,
    deleteLoading,
    editLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
  };
};

export const useSupplierOptions = () => {
  const { user } = useAuth();
  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<Supplier>>
  >(
    user?.company_id
      ? `v1/suppliers?company_id=${user.company_id}&size=1000`
      : null,
    fetcher as (
      url: string
    ) => Promise<ApiResponse<WithPagingResponse<Supplier>>>
  );

  return {
    data: data?.data?.records || [],
    loading: (!error && !data) || isValidating,
  };
};
