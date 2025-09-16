"use client"

import AxiosClient from "@/services/apiConfig";
import { useRouter } from "next/navigation"
import { ReactNode, createContext, useEffect } from "react"

type ErrorHandlerContextType = {
};

const ErrorHandlerContext = createContext<ErrorHandlerContextType | undefined>(undefined);

export const ErrorHandlerProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        Array.from(AxiosClient.getInstances().values()).forEach((key) => {
                key.interceptors.response.use(
                    null,
                    (error) => {
                        if (error?.response?.data?.code) {
                            switch (error.response.data.code) {
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
                                    router.push("/error/default");
                                    break;
                            }
                        }
                        if (error?.response?.data?.message) {
                            return Promise.reject(new Error(error.response.data.message))
                        }
                        return Promise.reject(error)
                    }
                )
            })
    }, [router]);

    return (
        <ErrorHandlerContext.Provider value={{ }}>
            {children}
        </ErrorHandlerContext.Provider>
    );
};
