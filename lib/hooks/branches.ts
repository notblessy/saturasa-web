import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";
import useSWR from "swr";

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface BranchesResponse {
  records: Branch[];
  total: number;
  page: number;
  size: number;
}

export const useBranchOptions = () => {
  const { user } = useAuth();
  const { data, error, isValidating } = useSWR<ApiResponse<BranchesResponse>>(
    user?.company_id
      ? `v1/branches?size=1000`
      : null,
    fetcher
  );

  return {
    data: data?.data?.records || [],
    loading: (!error && !data) || isValidating,
  };
};

