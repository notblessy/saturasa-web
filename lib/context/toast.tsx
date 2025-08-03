"use client";

import React, { useCallback } from "react";
import { createContext, useState, useContext } from "react";
import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title: string;
  message: string;
  color: "orange" | "red" | "green";
}

type ToastFunction = (options: ToastOptions) => void;

const ToastContext = createContext<ToastFunction>(() => {});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const show = useCallback((options: ToastOptions) => {
    const { title, message, color } = options;

    if (color === "red") {
      sonnerToast.error(title, { description: message });
    } else if (color === "green") {
      sonnerToast.success(title, { description: message });
    } else {
      sonnerToast(title, { description: message });
    }
  }, []);

  return <ToastContext.Provider value={show}>{children}</ToastContext.Provider>;
};

const useToast = () => useContext(ToastContext);

export default useToast;
