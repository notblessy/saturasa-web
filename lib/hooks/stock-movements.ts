import useSWR from "swr";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";

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

interface StockMovementsResponse {
  records: StockMovement[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

export const useStockMovements = (
  productId: string | null,
  branchId: string | null,
  page: number = 1,
  size: number = 20
) => {
  const { user } = useAuth();

  const pathKey =
    user?.company_id && productId && branchId
      ? `v1/reports/stock-movements?product_id=${productId}&branch_id=${branchId}&page=${page}&size=${size}`
      : null;

  const { data, error, isValidating } = useSWR<
    ApiResponse<StockMovementsResponse>
  >(pathKey, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data?.data,
    isLoading: !error && !data && !!pathKey,
    isValidating,
    error,
  };
};
