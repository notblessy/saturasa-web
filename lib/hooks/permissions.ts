import useSWR from "swr";

export interface Permission {
  id: string;
  name: string;
  code: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export const usePermissionOptions = () => {
  const pathKey = `v1/permissions/options`;
  const { data, error, isValidating } =
    useSWR<ApiResponse<Permission[]>>(pathKey);

  return {
    data: data?.data || [],
    loading: (!error && !data) || isValidating,
  };
};
