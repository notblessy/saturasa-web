import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";

interface Category {
  id: string;
  slug: string;
  company_id: string;
  parent_id?: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  parent?: Category | null;
  children?: Category[];
}

export const useCategories = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");

  const pathKey = `v1/categories?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&name=${keyword}`;
  const { data, error, isValidating } =
    useSWR<ApiResponse<WithPagingResponse<Category>>>(pathKey);

  const onAdd = useCallback(
    async (data: Partial<Category>) => {
      setLoading(true);
      try {
        data.company_id = user?.company_id;
        const { data: res } = await api.post("v1/categories", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success add category",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message,
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
        setLoading(false);
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
        }
      }
    },
    [setPage, setSize, setSort, setKeyword]
  );

  const onEdit = useCallback(
    async (category: Category) => {
      try {
        setEditLoading(true);

        category.company_id = user?.company_id as string;

        const { data: res } = await api.put(
          "v1/categories/" + category.id,
          category
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success update category",
            color: "orange",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          message:
            error instanceof Error ? error.message : "Something went wrong",
          color: "red",
        });
      } finally {
        setEditLoading(false);
      }
    },
    [pathKey, toast]
  );

  const onDelete = useCallback(
    async (id: string) => {
      try {
        setDeleteLoading(true);

        const { data: res } = await api.delete(
          `/v1/categories/${id}?company_id=${user?.company_id}`
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success delete category",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: "Something went wrong",
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
    data: data?.data ? data?.data : { records: [], total: 0, page: 1, size: 5 },
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

export const useCategoryOptions = () => {
  const { data, error, isValidating } = useSWR<ApiResponse<Category[]>>(
    `v1/categories/options`
  );

  return {
    data: data?.data ? data?.data : null,
    loading: (!error && !data) || isValidating,
  };
};
