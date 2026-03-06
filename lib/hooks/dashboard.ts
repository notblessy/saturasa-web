import useSWR from "swr";
import { useAuth } from "../context/auth";

export interface DashboardSummary {
  total_products: number;
  active_productions: number;
  total_suppliers: number;
  inventory_value: string;
  purchase_status_breakdown: Record<string, number>;
  recent_activities: RecentActivity[];
}

export interface RecentActivity {
  type: string;
  product_name: string;
  amount: string;
  branch_name: string;
  created_at: string;
}

export const useDashboardSummary = () => {
  const { user } = useAuth();
  const pathKey = user?.company_id
    ? `v1/dashboard/summary`
    : null;
  const { data, error, isValidating } =
    useSWR<ApiResponse<DashboardSummary>>(pathKey);

  return {
    data: data?.data || null,
    loading: !error && !data,
    error,
    isValidating,
  };
};
