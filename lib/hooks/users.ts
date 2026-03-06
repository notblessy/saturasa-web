import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";

export interface CompanyUser {
  id: string;
  company_id: string;
  name: string;
  email: string;
  username: string;
  role_id?: string;
  staff_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  role?: { id: string; name: string; code: string };
  staff?: { id: string; name: string } | null;
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

export const useCompanyUsers = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [roleId, setRoleId] = useState("");

  const pathKey = user?.company_id
    ? `v1/company/users?page=${page}&size=${size}&keyword=${keyword}${
        roleId ? `&role_id=${roleId}` : ""
      }`
    : null;

  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<CompanyUser>>
  >(pathKey);

  const onAdd = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      role_id: string;
      staff_id?: string;
    }) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("v1/company/users", data);
        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "User created",
            color: "orange",
          });
        } else {
          toast({ title: "Error", message: res.message, color: "red" });
        }
      } catch {
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
        if (key === "page") setPage(value);
        else if (key === "size") setSize(value);
        else if (key === "keyword") setKeyword(value);
        else if (key === "role_id") setRoleId(value);
      }
    },
    []
  );

  const onEdit = useCallback(
    async (userData: {
      id: string;
      name: string;
      email: string;
      role_id: string;
      staff_id?: string;
    }) => {
      try {
        setEditLoading(true);
        const { data: res } = await api.put(
          "v1/company/users/" + userData.id,
          userData
        );
        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "User updated",
            color: "orange",
          });
        } else {
          toast({ title: "Error", message: res.message, color: "red" });
        }
      } catch {
        toast({
          title: "Error",
          message: "Something went wrong",
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
        const { data: res } = await api.delete(`v1/company/users/${id}`);
        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "User deleted",
            color: "orange",
          });
        } else {
          toast({
            title: "Error",
            message: res.message || "Something went wrong",
            color: "red",
          });
        }
      } catch {
        toast({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
      } finally {
        setDeleteLoading(false);
      }
    },
    [pathKey, toast]
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
