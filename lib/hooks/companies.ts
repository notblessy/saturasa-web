import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";
import useSWR from "swr";

export interface Company {
  id: string;
  slug: string;
  name: string;
  website: string;
  logo: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export const useCompany = () => {
  const { user } = useAuth();
  const { data, error, isValidating } = useSWR<ApiResponse<Company>>(
    user?.company_id ? `v1/companies/${user.company_id}` : null,
    fetcher
  );

  return {
    company: data?.data || null,
    loading: (!error && !data) || isValidating,
  };
};

