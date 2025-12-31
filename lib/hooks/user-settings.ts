import { useCallback, useState } from "react";
import { mutate } from "swr";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";

interface UpdateProfileRequest {
  username: string;
  name: string;
  email: string;
}

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

interface ApiResponseWithSuccess<T> {
  data: T;
  message: string;
  success: boolean;
}

export const useUserSettings = () => {
  const toast = useToast();
  const { user } = useAuth();

  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      setUpdateProfileLoading(true);
      try {
        const { data: res } = await api.put<ApiResponseWithSuccess<any>>(
          "v1/users",
          data
        );

        if (res.success) {
          // Invalidate user profile cache
          mutate("v1/users");
          toast({
            title: "Success",
            message: res.message || "Profile updated successfully",
            color: "orange",
          });
          return { success: true };
        } else {
          toast({
            title: "Error",
            message: res.message || "Failed to update profile",
            color: "red",
          });
          return { success: false, error: res.message };
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to update profile";
        toast({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
        return { success: false, error: errorMessage };
      } finally {
        setUpdateProfileLoading(false);
      }
    },
    [toast]
  );

  const changePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      setChangePasswordLoading(true);
      try {
        const { data: res } = await api.put<ApiResponseWithSuccess<any>>(
          "v1/users/password",
          data
        );

        if (res.success) {
          toast({
            title: "Success",
            message: res.message || "Password changed successfully",
            color: "orange",
          });
          return { success: true };
        } else {
          toast({
            title: "Error",
            message: res.message || "Failed to change password",
            color: "red",
          });
          return { success: false, error: res.message };
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to change password";
        toast({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
        return { success: false, error: errorMessage };
      } finally {
        setChangePasswordLoading(false);
      }
    },
    [toast]
  );

  return {
    updateProfile,
    changePassword,
    updateProfileLoading,
    changePasswordLoading,
  };
};

