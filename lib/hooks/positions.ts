import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";

export interface Position {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
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
  success: boolean;
}

export const usePositions = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");

  const pathKey = `v1/positions?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&keyword=${keyword}`;
  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<Position>>
  >(pathKey);

  const onAdd = useCallback(
    async (data: Partial<Position>) => {
      setLoading(true);
      try {
        data.company_id = user?.company_id;
        const { data: res } = await api.post("v1/positions", data);
        if (res.success) {
          mutate(pathKey);
          toast({ title: "Success", message: "Position created", color: "orange" });
        } else {
          toast({ title: "Error", message: res.message, color: "red" });
        }
      } catch {
        toast({ title: "Error", message: "Something went wrong", color: "red" });
      } finally {
        setLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  const onQuery = useCallback(
    (props: Record<string, any>) => {
      for (const [key, value] of Object.entries(props)) {
        if (key === "page") setPage(value);
        else if (key === "size") setSize(value);
        else if (key === "sort") setSort(value);
        else if (key === "keyword") setKeyword(value);
      }
    },
    []
  );

  const onEdit = useCallback(
    async (position: Position) => {
      try {
        setEditLoading(true);
        position.company_id = user?.company_id as string;
        const { data: res } = await api.put("v1/positions/" + position.id, position);
        if (res.success) {
          mutate(pathKey);
          toast({ title: "Success", message: "Position updated", color: "orange" });
        }
      } catch (error) {
        toast({ title: "Error", message: error instanceof Error ? error.message : "Something went wrong", color: "red" });
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
        const { data: res } = await api.delete(`/v1/positions/${id}?company_id=${user?.company_id}`);
        if (res.success) {
          mutate(pathKey);
          toast({ title: "Success", message: "Position deleted", color: "orange" });
        } else {
          toast({ title: "Error", message: res.message || "Something went wrong", color: "red" });
        }
      } catch {
        toast({ title: "Error", message: "Something went wrong", color: "red" });
      } finally {
        setDeleteLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  return {
    data: data?.data
      ? {
          records: data.data.records,
          total: data.data.page_summary?.total ?? 0,
          page: data.data.page_summary?.page ?? 1,
          size: data.data.page_summary?.size ?? 10,
          hasNext: data.data.page_summary?.hasNext ?? false,
        }
      : undefined,
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

export const usePositionOptions = () => {
  const { user } = useAuth();
  const pathKey = user?.company_id ? `v1/positions/options` : null;
  const { data, error, isValidating } = useSWR<ApiResponse<Position[]>>(pathKey);

  return {
    data: data?.data || [],
    loading: (!error && !data) || isValidating,
  };
};
