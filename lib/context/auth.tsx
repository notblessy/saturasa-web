"use client";

import useSWR from "swr";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useCookies } from "react-cookie";

import api from "@/lib/utils/api";
import useToast from "./toast";
import { useRouter } from "next/navigation";

// Helper function to decode JWT token
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

interface User {
  id: string;
  email: string;
  name: string;
  company_id: string;
  role: string;
}

interface AuthContextType {
  loading: boolean;
  user: User | null;
  onLogin: (data: { username: string; password: string }) => Promise<void>;
  onLogout: () => void;
}

const AuthCtx = createContext<AuthContextType>({
  loading: false,
  user: null,
  onLogin: async () => {},
  onLogout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const toast = useToast();

  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);

  const [accessToken, setAccessToken] = useState(cookies.accessToken || "");

  const {
    data: user,
    isLoading,
    isValidating,
  } = useSWR<ApiResponse<User>>(() => (accessToken ? "/v1/users" : null));

  useEffect(() => {
    setAccessToken(cookies.accessToken);
  }, [cookies]);

  const [loading, setLoading] = useState(false);

  const onLogin = useCallback(
    async (data: { username: string; password: string }) => {
      setLoading(true);
      try {
        const { data: res } = await api.post("/v1/auth/users/login", data);

        if (res.data && res.success) {
          var expiredAt = new Date();
          expiredAt.setMonth(expiredAt.getMonth() + 1);

          setAccessToken(res.data.token);
          setCookie("accessToken", res.data.token, {
            path: "/",
            maxAge: expiredAt.getTime(),
          });

          // Decode JWT token to check user type
          const decodedToken = decodeJWT(res.data.token);

          setTimeout(() => {
            // Check if user is superadmin (no company_id)
            if (
              decodedToken &&
              (!decodedToken.company_id || decodedToken.company_id === "")
            ) {
              router.push("/superadmin");
            } else {
              router.push("/dashboard");
            }
          }, 500);
        } else if (res.success && !res.data) {
          toast({
            title: "Error",
            message: res.message,
            color: "red",
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
    [router, setCookie, toast]
  );

  const onLogout = () => {
    setAccessToken("");
    removeCookie("accessToken", { path: "/" });
    router.push("/login");
  };

  return (
    <AuthCtx.Provider
      value={{
        loading: loading || isLoading || isValidating,
        user: user?.data ? user?.data : null,
        onLogin,
        onLogout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
