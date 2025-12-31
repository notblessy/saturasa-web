import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";

interface Inventory {
  product_id: string;
  product_name: string;
  branch_id: string;
  branch_name: string;
  total_stock: number;
  last_updated: string;
  unit_symbol?: string;
}

interface WithPagingResponse<T> {
  records: T[];
  page_summary: {
    total: number;
    page: number;
    size: number;
    hasNext: boolean;
  };
}

interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export const useInventories = () => {
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("");
  const [keyword, setKeyword] = useState("");
  const [branchId, setBranchId] = useState("");

  const pathKey = user?.company_id
    ? `v1/inventories?company_id=${
        user.company_id
      }&page=${page}&size=${size}&sort=${sort}&keyword=${keyword}${
        branchId ? `&branch_id=${branchId}` : ""
      }`
    : null;
  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<Inventory>>
  >(
    pathKey as string,
    fetcher as (
      url: string
    ) => Promise<ApiResponse<WithPagingResponse<Inventory>>>,
    {}
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
        } else if (key === "branch_id") {
          setBranchId(value);
        }
      }
    },
    [setPage, setSize, setSort, setKeyword, setBranchId]
  );

  return {
    data: data?.data
      ? {
          records: data.data.records,
          total: data.data.page_summary.total,
          page: data.data.page_summary.page,
          size: data.data.page_summary.size,
        }
      : undefined,
    error,
    isValidating,
    loading: isValidating && !error && !data,
    onQuery,
  };
};
