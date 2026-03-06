import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";
import { useRouter } from "next/navigation";

export interface SalesItem {
  id: string;
  sales_id: string;
  product_id: string;
  measurement_unit_id: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  sub_total: number;
  product?: { id: string; name: string; category?: { id: string; name: string } };
  measurement_unit?: { id: string; name: string; symbol: string };
}

export interface Sale {
  id: string;
  company_id: string;
  branch_id: string;
  customer_id: string;
  sales_date: string | null;
  status: string;
  grand_total: number;
  notes: string;
  created_at: string;
  updated_at: string;
  customer?: { id: string; name: string };
  branch?: { id: string; name: string };
  sales_items?: SalesItem[];
}

export interface SalesRequest {
  branch_id: string;
  customer_id: string;
  sales_date?: string | null;
  notes?: string;
  items: SalesItemRequest[];
}

export interface SalesItemRequest {
  product_id: string;
  unit_id?: string | null;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
}

interface SalesResponse {
  records: Sale[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

export const useSales = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const pathKey = user?.company_id
    ? `v1/sales?page=${page}&size=${size}&sort=${sort}&keyword=${keyword}&status=${status}`
    : null;
  const { data, error, isValidating } = useSWR<ApiResponse<SalesResponse>>(
    pathKey,
    fetcher,
    {}
  );

  const onAdd = useCallback(
    async (data: SalesRequest) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("v1/sales", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Sale created successfully",
            color: "orange",
          });
          router.push("/dashboard/sales");
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          message: error?.response?.data?.message || "Something went wrong",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    },
    [pathKey, toast, router, user?.company_id]
  );

  const onQuery = useCallback((props: Record<string, any>) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === "page") {
        setPage(value);
      } else if (key === "size") {
        setSize(value);
      } else if (key === "sort") {
        setSort(value);
      } else if (key === "keyword") {
        setKeyword(value);
      } else if (key === "status") {
        setStatus(value);
      }
    }
  }, []);

  const onEdit = useCallback(
    async (id: string, data: SalesRequest) => {
      try {
        setEditLoading(true);
        const { data: res } = await api.put(`v1/sales/${id}`, data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Sale updated successfully",
            color: "orange",
          });
          router.push("/dashboard/sales");
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          message: error?.response?.data?.message || "Something went wrong",
          color: "red",
        });
      } finally {
        setEditLoading(false);
      }
    },
    [pathKey, toast, router, user?.company_id]
  );

  const onDelete = useCallback(
    async (id: string) => {
      try {
        setDeleteLoading(true);

        const { data: res } = await api.delete(`v1/sales/${id}`);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Sale deleted successfully",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message || "Something went wrong",
            color: "red",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          message: error?.response?.data?.message || "Something went wrong",
          color: "red",
        });
      } finally {
        setDeleteLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  const onUpdateStatus = useCallback(
    async (id: string, status: string) => {
      try {
        setStatusLoading(true);

        const { data: res } = await api.patch(`v1/sales/${id}/status`, {
          status,
        });

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Sale status updated successfully",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message || "Something went wrong",
            color: "red",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          message: error?.response?.data?.message || "Something went wrong",
          color: "red",
        });
      } finally {
        setStatusLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  return {
    data: data?.data || {
      records: [],
      page_summary: { total: 0, page: 1, size: 10, hasNext: false },
    },
    error,
    isValidating,
    loading,
    deleteLoading,
    editLoading,
    statusLoading,
    onAdd,
    onQuery,
    onEdit,
    onDelete,
    onUpdateStatus,
  };
};

// Hook for fetching a single sale by ID
export const useSale = (salesId: string | null) => {
  const toast = useToast();
  const [statusLoading, setStatusLoading] = useState(false);

  const {
    data,
    error,
    isValidating,
    mutate: mutateSale,
  } = useSWR<ApiResponse<Sale>>(
    salesId ? `v1/sales/${salesId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const onUpdateStatus = useCallback(
    async (status: string) => {
      if (!salesId) return;
      try {
        setStatusLoading(true);
        const { data: res } = await api.patch(`v1/sales/${salesId}/status`, {
          status,
        });
        if (res.success) {
          mutateSale();
          toast({
            title: "Success",
            message: "Sale status updated successfully",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message || "Something went wrong",
            color: "red",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          message: error?.response?.data?.message || "Something went wrong",
          color: "red",
        });
      } finally {
        setStatusLoading(false);
      }
    },
    [salesId, mutateSale, toast]
  );

  return {
    sale: data?.data || null,
    isLoading: isValidating && !error && !data,
    error,
    statusLoading,
    onUpdateStatus,
    mutateSale,
  };
};
