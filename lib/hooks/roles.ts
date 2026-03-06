import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";

export interface Permission {
  id: string;
  name: string;
  code: string;
}

export interface Role {
  id: string;
  company_id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  permissions?: Permission[];
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

export const useRoles = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");

  const pathKey = user?.company_id
    ? `v1/roles?page=${page}&size=${size}&search=${search}`
    : null;

  const { data, error, isValidating } = useSWR<
    ApiResponse<WithPagingResponse<Role>>
  >(pathKey);

  const onAdd = useCallback(
    async (roleData: { name: string; code: string }) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("v1/roles", roleData);
        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Role created",
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

  const onQuery = useCallback((props: Record<string, any>) => {
    for (const [key, value] of Object.entries(props)) {
      if (key === "page") setPage(value);
      else if (key === "size") setSize(value);
      else if (key === "search" || key === "keyword") setSearch(value);
    }
  }, []);

  const onEdit = useCallback(
    async (role: { id: string; name: string; code: string }) => {
      try {
        setEditLoading(true);
        const { data: res } = await api.put("v1/roles/" + role.id, role);
        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Role updated",
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
        const { data: res } = await api.delete(`v1/roles/${id}`);
        if (res.success) {
          mutate(pathKey);
          toast({
            title: "Success",
            message: "Role deleted",
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

  const onAddPermission = useCallback(
    async (roleId: string, permissionId: string) => {
      try {
        const { data: res } = await api.post(
          `v1/roles/${roleId}/permissions`,
          { permission_id: permissionId }
        );
        if (res.success) {
          mutate(pathKey);
        } else {
          toast({ title: "Error", message: res.message, color: "red" });
        }
      } catch {
        toast({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
      }
    },
    [pathKey, toast]
  );

  const onRemovePermission = useCallback(
    async (roleId: string, permissionId: string) => {
      try {
        const { data: res } = await api.delete(
          `v1/roles/${roleId}/permissions/${permissionId}`
        );
        if (res.success) {
          mutate(pathKey);
        } else {
          toast({ title: "Error", message: res.message, color: "red" });
        }
      } catch {
        toast({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
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
    onAddPermission,
    onRemovePermission,
  };
};

export const useRoleOptions = () => {
  const { user } = useAuth();
  const pathKey = user?.company_id ? `v1/roles/options` : null;
  const { data, error, isValidating } = useSWR<ApiResponse<Role[]>>(pathKey);

  return {
    data: data?.data || [],
    loading: (!error && !data) || isValidating,
  };
};

export const useRole = (id: string | null) => {
  const { user } = useAuth();
  const pathKey = user?.company_id && id ? `v1/roles/${id}` : null;
  const { data, error, isValidating } = useSWR<ApiResponse<Role>>(pathKey);

  return {
    data: data?.data || null,
    loading: (!error && !data) || isValidating,
    mutateKey: pathKey,
  };
};
