"use client";

import AxiosClient from "@/services/apiConfig";
import { useRouter, usePathname } from "next/navigation";
import type { AxiosInstance } from "axios";
import { ReactNode, createContext, useEffect } from "react";

type ErrorHandlerContextType = {};

const ErrorHandlerContext = createContext<ErrorHandlerContextType | undefined>(undefined);

export const ErrorHandlerProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const skipRedirect = pathname === "/register" || pathname === "/login";

    const ejectors: Array<{ instance: AxiosInstance; id: number }> = [];

    Array.from(AxiosClient.getInstances().values()).forEach((instance) => {
      const id = instance.interceptors.response.use(
        (response) => response,
        (error) => {
          // Always propagate the server's message if present
          if (error?.response?.data?.message) {
            return Promise.reject(new Error(error.response.data.message));
          }

          // Do not navigate away when on /register or /login
          if (!skipRedirect) {
            const code = String(error?.response?.data?.code ?? "");
            switch (code) {
              case "404":
                router.push("/error/not-found");
                break;
              case "401":
                router.push("/error/unauthorized");
                break;
              case "403":
                router.push("/error/forbidden");
                break;
              case "500":
                router.push("/error/internal-server-error");
                break;
              case "503":
                router.push("/error/service-unavailable");
                break;
              default:
                if (code) {
                  router.push("/error/default");
                }
                break;
            }
          }

          return Promise.reject(error);
        }
      );

      ejectors.push({ instance, id });
    });

    // Cleanup to prevent stacking interceptors on re-renders / route changes
    return () => {
      ejectors.forEach(({ instance, id }) => instance.interceptors.response.eject(id));
    };
  }, [router, pathname]);

  return <ErrorHandlerContext.Provider value={{}}>{children}</ErrorHandlerContext.Provider>;
};
