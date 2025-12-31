import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";

export interface ProductionItem {
  id: string;
  production_id: string;
  bom_detail_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
  };
  bom_detail?: {
    id: string;
    quantity: number;
    waste: number;
    unit_id: string;
    measurement_unit?: {
      id: string;
      name: string;
      symbol: string;
    };
  };
}

export interface Production {
  id: string;
  company_id: string;
  branch_id: string;
  bom_id: string;
  quantity: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  bom?: {
    id: string;
    name: string;
    unit_id?: string;
    measurement_unit?: {
      id: string;
      name: string;
      symbol: string;
    };
    product?: {
      id: string;
      name: string;
    };
    bom_details?: Array<{
      id: string;
      product_id: string;
      unit_id: string;
      quantity: number;
      waste: number;
      product?: {
        id: string;
        name: string;
      };
      measurement_unit?: {
        id: string;
        name: string;
        symbol: string;
      };
    }>;
  };
  branch?: {
    id: string;
    name: string;
  };
  production_items?: ProductionItem[];
}

export interface ProductionRequest {
  company_id: string;
  branch_id: string;
  bom_id: string;
  quantity: number;
  notes?: string;
}

interface ProductionsResponse {
  records: Production[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

export const useProductions = () => {
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [bomId, setBomId] = useState("");

  const pathKey = user?.company_id
    ? `v1/productions?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&keyword=${keyword}&status=${status}&branch_id=${branchId}&bom_id=${bomId}`
    : null;
  const { data, error, isValidating } = useSWR<ApiResponse<ProductionsResponse>>(
    pathKey,
    fetcher,
    {}
  );

  const onAdd = useCallback(
    async (data: ProductionRequest) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("v1/productions", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Production created successfully",
            color: "orange",
          });
          return { success: true };
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
          return { success: false, error: res.message };
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Something went wrong";
        toast({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [pathKey, toast]
  );

  const onUpdateStatus = useCallback(
    async (id: string, status: string) => {
      setStatusLoading(true);
      try {
        const { data: res } = await api.patch(`v1/productions/${id}/status`, {
          status,
        });

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Production status updated successfully",
            color: "orange",
          });
          return { success: true };
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
          return { success: false, error: res.message };
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Something went wrong";
        toast({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
        return { success: false, error: errorMessage };
      } finally {
        setStatusLoading(false);
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
        } else if (key === "status") {
          setStatus(value);
        } else if (key === "branch_id") {
          setBranchId(value);
        } else if (key === "bom_id") {
          setBomId(value);
        }
      }
    },
    []
  );

  return {
    data: data?.data,
    error,
    isValidating,
    loading,
    statusLoading,
    onAdd,
    onUpdateStatus,
    onQuery,
  };
};

export const useProduction = (id: string) => {
  const { data, error, isValidating } = useSWR<ApiResponse<Production>>(
    id ? `v1/productions/${id}` : null,
    fetcher
  );

  return {
    production: data?.data,
    isLoading: isValidating && !error && !data,
    error,
  };
};

export const useBOMOptions = () => {
  const { user } = useAuth();
  const { data, error, isValidating } = useSWR<ApiResponse<any>>(
    user?.company_id
      ? `v1/boms?company_id=${user?.company_id}&page=1&size=1000`
      : null,
    fetcher
  );

  return {
    data: data?.data?.records || [],
    loading: (!error && !data) || isValidating,
  };
};

