import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";

export interface ChartOfAccount {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category: string;
  parent_id?: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  parent?: ChartOfAccount | null;
  children?: ChartOfAccount[];
}

export const useChartOfAccounts = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [sort, setSort] = useState("code");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");

  // Fetch all accounts without pagination
  const pathKey = `v1/chart-of-accounts?company_id=${user?.company_id}&sort=${sort}&keyword=${keyword}&category=${category}`;
  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<ChartOfAccount>>
  >(pathKey, fetcher, {});

  const onAdd = useCallback(
    async (data: Partial<ChartOfAccount>) => {
      setLoading(true);
      try {
        data.company_id = user?.company_id;
        const { data: res } = await api.post("v1/chart-of-accounts", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Account added successfully",
            color: "orange",
          });
          return true;
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  const onQuery = useCallback(
    (props: Record<string, any>) => {
      for (const [key, value] of Object.entries(props)) {
        if (key === "sort") {
          setSort(value);
        } else if (key === "keyword") {
          setKeyword(value);
        } else if (key === "category") {
          setCategory(value);
        }
      }
    },
    [setSort, setKeyword, setCategory]
  );

  const onEdit = useCallback(
    async (account: Partial<ChartOfAccount>) => {
      try {
        setEditLoading(true);

        account.company_id = user?.company_id as string;

        const { data: res } = await api.put(
          "v1/chart-of-accounts/" + account.id,
          account
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Account updated successfully",
            color: "orange",
          });
          return true;
        } else {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          message:
            error instanceof Error ? error.message : "Something went wrong",
          color: "red",
        });
        return false;
      } finally {
        setEditLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  const onDelete = useCallback(
    async (id: string) => {
      try {
        setDeleteLoading(true);

        const { data: res } = await api.delete(
          `/v1/chart-of-accounts/${id}?company_id=${user?.company_id}`
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Account deleted successfully",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message || "Something went wrong",
            color: "red",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
      } finally {
        setDeleteLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  return {
    data: data?.data || {
      records: [],
      page_meta: { total: 0, page: 1, size: 10 },
    },
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

export const useChartOfAccountOptions = () => {
  const { data, error, isValidating } = useSWR<ApiResponse<ChartOfAccount[]>>(
    `v1/chart-of-accounts/options`,
    fetcher
  );

  return {
    data: data?.data ? data?.data : [],
    loading: (!error && !data) || isValidating,
  };
};
