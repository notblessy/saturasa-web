import { useCallback, useState } from "react";
import useSWR from "swr";
import { useAuth } from "../context/auth";

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface PageSummary {
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
}

// Inventory Valuation
export interface ValuationRecord {
  product_id: string;
  product_name: string;
  branch_id: string;
  branch_name: string;
  total_stock: number;
  avg_cogs: number;
  total_value: number;
}

interface ValuationResponse {
  records: ValuationRecord[];
  grand_total: number;
  page_summary: PageSummary;
}

export const useInventoryValuation = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [branchId, setBranchId] = useState("");
  const [productId, setProductId] = useState("");

  const pathKey = user?.company_id
    ? `v1/reports/inventory-valuation?company_id=${user.company_id}&page=${page}&size=${size}${
        branchId ? `&branch_id=${branchId}` : ""
      }${productId ? `&product_id=${productId}` : ""}`
    : null;

  const { data, error, isValidating } =
    useSWR<ApiResponse<ValuationResponse>>(pathKey);

  const onQuery = useCallback((props: Record<string, any>) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === "page") setPage(value);
      else if (key === "size") setSize(value);
      else if (key === "branch_id") setBranchId(value);
      else if (key === "product_id") setProductId(value);
    }
  }, []);

  return {
    data: data?.data || null,
    loading: isValidating && !error && !data,
    isValidating,
    onQuery,
  };
};

// Stock Movements
export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  branch_id: string;
  branch_name: string;
  type: string;
  amount: number;
  created_at: string;
}

interface MovementsResponse {
  records: StockMovement[];
  page_summary: PageSummary;
}

export const useStockMovements = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [branchId, setBranchId] = useState("");
  const [productId, setProductId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const pathKey = user?.company_id
    ? `v1/reports/stock-movements?company_id=${user.company_id}&page=${page}&size=${size}${
        branchId ? `&branch_id=${branchId}` : ""
      }${productId ? `&product_id=${productId}` : ""}${
        dateFrom ? `&date_from=${dateFrom}` : ""
      }${dateTo ? `&date_to=${dateTo}` : ""}`
    : null;

  const { data, error, isValidating } =
    useSWR<ApiResponse<MovementsResponse>>(pathKey);

  const onQuery = useCallback((props: Record<string, any>) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === "page") setPage(value);
      else if (key === "size") setSize(value);
      else if (key === "branch_id") setBranchId(value);
      else if (key === "product_id") setProductId(value);
      else if (key === "date_from") setDateFrom(value);
      else if (key === "date_to") setDateTo(value);
    }
  }, []);

  return {
    data: data?.data || null,
    loading: isValidating && !error && !data,
    isValidating,
    onQuery,
  };
};

// Purchase Summary
export interface PurchaseStatusSummary {
  status: string;
  count: number;
  total: number;
}

interface PurchaseSummaryResponse {
  total_purchases: number;
  total_amount: number;
  by_status: PurchaseStatusSummary[];
}

export const usePurchaseSummary = () => {
  const { user } = useAuth();
  const [branchId, setBranchId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const pathKey = user?.company_id
    ? `v1/reports/purchase-summary?company_id=${user.company_id}${
        branchId ? `&branch_id=${branchId}` : ""
      }${dateFrom ? `&date_from=${dateFrom}` : ""}${
        dateTo ? `&date_to=${dateTo}` : ""
      }`
    : null;

  const { data, error, isValidating } =
    useSWR<ApiResponse<PurchaseSummaryResponse>>(pathKey);

  const onQuery = useCallback((props: Record<string, any>) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === "branch_id") setBranchId(value);
      else if (key === "date_from") setDateFrom(value);
      else if (key === "date_to") setDateTo(value);
    }
  }, []);

  return {
    data: data?.data || null,
    loading: isValidating && !error && !data,
    isValidating,
    onQuery,
  };
};

// Production Summary
export interface ProductionStatusSummary {
  status: string;
  count: number;
}

interface ProductionSummaryResponse {
  total_productions: number;
  by_status: ProductionStatusSummary[];
}

export const useProductionSummary = () => {
  const { user } = useAuth();
  const [branchId, setBranchId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const pathKey = user?.company_id
    ? `v1/reports/production-summary?company_id=${user.company_id}${
        branchId ? `&branch_id=${branchId}` : ""
      }${dateFrom ? `&date_from=${dateFrom}` : ""}${
        dateTo ? `&date_to=${dateTo}` : ""
      }`
    : null;

  const { data, error, isValidating } =
    useSWR<ApiResponse<ProductionSummaryResponse>>(pathKey);

  const onQuery = useCallback((props: Record<string, any>) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === "branch_id") setBranchId(value);
      else if (key === "date_from") setDateFrom(value);
      else if (key === "date_to") setDateTo(value);
    }
  }, []);

  return {
    data: data?.data || null,
    loading: isValidating && !error && !data,
    isValidating,
    onQuery,
  };
};
