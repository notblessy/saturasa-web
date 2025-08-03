"use client";

import { fetcher } from "@/lib/utils/api";
import { SWRConfig } from "swr";
import { CookiesProvider } from "react-cookie";
import { AuthProvider } from "@/lib/context/auth";
import { ToastProvider } from "@/lib/context/toast";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookiesProvider>
      <ToastProvider>
        <SWRConfig
          value={{
            refreshInterval: 0,
            fetcher,
          }}
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </SWRConfig>
      </ToastProvider>
    </CookiesProvider>
  );
}