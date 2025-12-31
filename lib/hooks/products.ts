import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";
import { fetcher } from "@/lib/utils/api";
import { useRouter } from "next/navigation";

export interface ProductSpecification {
  id?: string;
  company_id?: string;
  product_id?: string;
  measurement_unit_id: string;
  base_price: number;
  conversion_factor: number;
  notes: string;
  is_base_unit: boolean;
  is_stock_unit: boolean;
  is_purchase_unit: boolean;
  is_sales_unit: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  measurement_unit?: {
    id: string;
    name: string;
    label: string;
    symbol?: string;
  };
}

export interface Product {
  id: string;
  slug: string;
  company_id: string;
  category_id: string;
  name: string;
  image: string;
  purchasable: boolean;
  salesable: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  specifications?: ProductSpecification[];
  category?: {
    id: string;
    name: string;
  };
}

export const useProducts = () => {
  const router = useRouter();
  const toast = useToast();

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [sort, setSort] = useState("-created_at");
  const [keyword, setKeyword] = useState("");

  const pathKey = `v1/products?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&keyword=${keyword}`;
  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<Product>>
  >(pathKey, fetcher, {});

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

          router.push("/dashboard/products");
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
    async (product: Partial<Product>) => {
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

          router.push("/dashboard/products");
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
          message:
            error instanceof Error ? error.message : "Something went wrong",
          color: "red",
        });
      } finally {
        setEditLoading(false);
      }
    },
    [pathKey, toast, router, user?.company_id]
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
    data: data?.data || { records: [], total: 0, page: 1, size: 5 },
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

// Hook for fetching a single product by ID
export const useProduct = (productId: string | null) => {
  const { user } = useAuth();

  const {
    data,
    error,
    isValidating,
    mutate: mutateProduct,
  } = useSWR<ApiResponse<Product>>(
    productId && user?.company_id
      ? `v1/products/${productId}?company_id=${user.company_id}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    product: data?.data || null,
    isLoading: isValidating && !error && !data,
    error,
    mutateProduct,
  };
};

export const useProductOptions = () => {
  const { user } = useAuth();
  const { data, error, isValidating } = useSWR<ApiResponse<WithPagingResponse<Product>>>(
    user?.company_id
      ? `v1/products?company_id=${user.company_id}&size=1000`
      : null,
    fetcher
  );

  return {
    data: data?.data?.records || [],
    loading: (!error && !data) || isValidating,
  };
};
