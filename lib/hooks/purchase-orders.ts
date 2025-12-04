import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";
import { useRouter } from "next/navigation";

// Types matching backend Purchase model exactly
export interface PurchaseItem {
  id: string;
  company_id: string;
  purchase_id: string;
  product_id: string;
  measurement_unit_id: string;
  quantity: number;
  price: number;
  sub_total: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  product?: {
    id: string;
    name: string;
    slug?: string;
    category?: {
      id: string;
      name: string;
    };
  };
  measurement_unit?: {
    id: string;
    name: string;
    symbol: string;
  };
}

export interface Purchase {
  id: string;
  company_id: string;
  branch_id: string;
  supplier_id: string;
  invoice_number: string;
  invoice_date: string | null;
  delivery_date: string | null;
  status: string;
  payment_method?: string | null;
  grand_total: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  supplier?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  purchase_items?: PurchaseItem[];
}

// Request types for creating/updating purchases
export interface PurchaseRequest {
  branch_id: string;
  supplier_id: string;
  invoice_number?: string;
  invoice_date?: string | null;
  delivery_date?: string | null;
  items: PurchaseItemRequest[];
}

export interface PurchaseItemRequest {
  product_id: string;
  unit_id?: string | null;
  quantity: number;
  price: number;
  description?: string;
  discount: number;
  tax: number;
}

interface PurchasesResponse {
  records: Purchase[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

export const usePurchaseOrders = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const pathKey = user?.company_id
    ? `v1/purchases?page=${page}&size=${size}&sort=${sort}&keyword=${keyword}&status=${status}`
    : null;
  const { data, error, isValidating } = useSWR<ApiResponse<PurchasesResponse>>(
    pathKey,
    fetcher,
    {}
  );

  const onAdd = useCallback(
    async (data: PurchaseRequest) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("v1/purchases", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Purchase invoice created successfully",
            color: "orange",
          });
          router.push("/dashboard/purchase-orders");
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
        } else if (key === "status") {
          setStatus(value);
        }
      }
    },
    []
  );

  const onEdit = useCallback(
    async (id: string, data: PurchaseRequest) => {
      try {
        setEditLoading(true);
        const { data: res } = await api.put(`v1/purchases/${id}`, data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Purchase invoice updated successfully",
            color: "orange",
          });
          router.push("/dashboard/purchase-orders");
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

        const { data: res } = await api.delete(`v1/purchases/${id}`);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Purchase invoice deleted successfully",
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

  return {
    data: data?.data || { records: [], page_summary: { total: 0, page: 1, size: 10, hasNext: false } },
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

// Hook for fetching a single purchase by ID
export const usePurchaseOrder = (purchaseId: string | null) => {
  const {
    data,
    error,
    isValidating,
    mutate: mutatePurchase,
  } = useSWR<ApiResponse<Purchase>>(
    purchaseId ? `v1/purchases/${purchaseId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    purchase: data?.data || null,
    isLoading: isValidating && !error && !data,
    error,
    mutatePurchase,
  };
};

