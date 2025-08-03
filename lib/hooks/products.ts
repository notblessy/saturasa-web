import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";

export interface Product {
  id: string;
  slug: string;
  company_id: string;
  name: string;
  description?: string;
  sku: string;
  category_id: string;
  measurement_unit_id: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export const useProducts = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");

  const pathKey = `v1/products?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&keyword=${keyword}`;
  const { data, error, isValidating } =
    useSWR<WithPagingResponse<Product>>(pathKey);

  const onAdd = useCallback(
    async (data: Partial<Product>) => {
      setLoading(true);
      try {
        data.company_id = user?.company_id as string;
        const { data: res } = await api.post("v1/products", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success add product",
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
    async (product: Product) => {
      try {
        setEditLoading(true);

        product.company_id = user?.company_id as string;

        const { data: res } = await api.put(
          "v1/products/" + product.id,
          product
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success update product",
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
          `/v1/products/${id}?company_id=${user?.company_id}`
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success delete product",
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
    data,
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
