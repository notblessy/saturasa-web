"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/saturasui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { useAuth } from "@/lib/context/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !user && !loading) {
      router.push("/login");
    }
  }, [user, loading, isHydrated]);

  // Show loading during hydration to prevent mismatch
  if (!isHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary mb-4"></div>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0 bg-[#FDFDFC]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
