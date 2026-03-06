import { useCallback, useState } from "react";
import useToast from "../context/toast";
import api from "@/lib/utils/api";
import { useAuth } from "../context/auth";

export const useStockAdjustment = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onAdjust = useCallback(
    async (data: {
      branch_id: string;
      product_id: string;
      type: string;
      amount: number;
      reason?: string;
    }) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("v1/stock-adjustments", data);
        if (res.success) {
          toast({
            title: "Success",
            message: "Stock adjusted successfully",
            color: "orange",
          });
          return true;
        } else {
          toast({ title: "Error", message: res.message, color: "red" });
          return false;
        }
      } catch {
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
    [toast]
  );

  return { loading, onAdjust, companyId: user?.company_id };
};
