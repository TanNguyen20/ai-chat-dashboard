import { AxiosInstance, AxiosRequestConfig } from "axios"

export interface TypedAxiosInstance extends AxiosInstance {
    get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>
    post<T = any, R = T>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<R>
    put<T = any, R = T>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<R>
    delete<T = any, R = T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<R>
}