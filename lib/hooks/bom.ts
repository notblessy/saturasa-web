import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api, { fetcher } from "../utils/api";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";

interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

interface WithPagingResponse<T> {
  records: T[];
  page_meta: {
    total: number;
    page: number;
    size: number;
  };
}

export interface BOMDetail {
  id?: string;
  bom_id?: string;
  product_id: string;
  unit_id: string;
  quantity: number;
  waste: number;
  product?: {
    id: string;
    name: string;
  };
  measurement_unit?: {
    id: string;
    name: string;
    label: string;
  };
}

export interface BOM {
  id: string;
  slug: string;
  company_id: string;
  product_id: string;
  unit_id: string;
  name: string;
  type: string;
  additional_fixed_cost: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  product?: {
    id: string;
    name: string;
  };
  measurement_unit?: {
    id: string;
    name: string;
    label: string;
  };
  bom_details?: BOMDetail[];
}

export interface BOMWithDetailsRequest {
  company_id: string;
  product_id: string;
  unit_id: string;
  name: string;
  type: string;
  additional_fixed_cost: number;
  bom_details: {
    product_id: string;
    unit_id: string;
    quantity: number;
    waste: number;
  }[];
}

export const useBOMs = () => {
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
  const [type, setType] = useState("");
  const [productId, setProductId] = useState("");

  const pathKey = user?.company_id ? `v1/boms?company_id=${user?.company_id}&page=${page}&size=${size}&sort=${sort}&name=${keyword}&type=${type}&product_id=${productId}` : null;
  const { data, error, isValidating } = useSWR(
    pathKey,
    fetcher,
    {}
  );

  const onAdd = useCallback(
    async (data: BOMWithDetailsRequest) => {
      setLoading(true);
      try {
        data.company_id = user?.company_id as string;
        const { data: res } = await api.post("v1/boms", data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success add BOM",
            color: "orange",
          });

          router.push("/dashboard/bom");
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
    [pathKey, router, toast, user?.company_id]
  );

  const onEdit = useCallback(
    async (id: string, data: BOMWithDetailsRequest) => {
      setEditLoading(true);
      try {
        data.company_id = user?.company_id as string;
        const { data: res } = await api.put(`v1/boms/${id}`, data);

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success update BOM",
            color: "orange",
          });

          router.push("/dashboard/bom");
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
        setEditLoading(false);
      }
    },
    [pathKey, router, toast, user?.company_id]
  );

  const onDelete = useCallback(
    async (id: string) => {
      setDeleteLoading(true);
      try {
        const { data: res } = await api.delete(
          `v1/boms/${id}?company_id=${user?.company_id}`
        );

        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Success delete BOM",
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
        setDeleteLoading(false);
      }
    },
    [pathKey, toast, user?.company_id]
  );

  return {
    data: data?.data,
    error,
    isValidating,
    loading,
    deleteLoading,
    editLoading,
    page,
    setPage,
    size,
    setSize,
    sort,
    setSort,
    keyword,
    setKeyword,
    type,
    setType,
    productId,
    setProductId,
    onAdd,
    onEdit,
    onDelete,
  };
};

export const useBOM = (bomId: string | null) => {
  const toast = useToast();
  const { user } = useAuth();

  const pathKey = bomId && user?.company_id
    ? `v1/boms/${bomId}?company_id=${user?.company_id}`
    : null;
  const { data, error, isValidating } = useSWR(
    pathKey,
    fetcher,
    {}
  );

  return {
    data: data?.data,
    error,
    isValidating,
  };
};