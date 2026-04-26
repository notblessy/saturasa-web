import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";

export interface TransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  quantity: number;
  product?: { id: string; name: string };
}

export interface Transfer {
  id: string;
  company_id: string;
  source_branch_id: string;
  dest_branch_id: string;
  transfer_date: string | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  source_branch?: { id: string; name: string };
  dest_branch?: { id: string; name: string };
  transfer_items?: TransferItem[];
}

export interface TransferRequest {
  source_branch_id: string;
  dest_branch_id: string;
  transfer_date?: string | null;
  notes?: string;
  items: TransferItemRequest[];
}

export interface TransferItemRequest {
  product_id: string;
  quantity: number;
}

interface TransfersResponse {
  records: Transfer[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

export const useTransfers = () => {
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-created_at");

  const pathKey = user?.company_id
    ? `v1/transfers?page=${page}&size=${size}&sort=${sort}`
    : null;
  const { data, error, isValidating } = useSWR<ApiResponse<TransfersResponse>>(
    pathKey,
    fetcher,
    {}
  );

  const onAdd = useCallback(
    async (data: TransferRequest) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("v1/transfers", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Transfer created successfully",
            color: "orange",
          });
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
    [pathKey, toast]
  );

  const onQuery = useCallback((props: Record<string, any>) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === "page") {
        setPage(value);
      } else if (key === "size") {
        setSize(value);
      } else if (key === "sort") {
        setSort(value);
      }
    }
  }, []);

  return {
    data: data?.data || {
      records: [],
      page_summary: { total: 0, page: 1, size: 10, hasNext: false },
    },
    error,
    isValidating,
    loading,
    onAdd,
    onQuery,
  };
};
