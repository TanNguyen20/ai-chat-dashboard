import { TypedAxiosInstance } from "@/types/axios";
import { redirect } from 'next/navigation'
import { getUserInfoFromLocalStorage } from "@/utils/commons"
import axios from "axios"

class AxiosClient {
  private static readonly instances: Map<string, TypedAxiosInstance> = new Map()
  private static readonly interceptorsAttached: Set<string> = new Set()

  private constructor() { }

  public static getInstance(baseURL: string): TypedAxiosInstance  {
    if (!AxiosClient.instances.has(baseURL)) {
      const instance = axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }) as TypedAxiosInstance;
      AxiosClient.instances.set(baseURL, instance)
    }

    const instance = AxiosClient.instances.get(baseURL)!

    if (!AxiosClient.interceptorsAttached.has(baseURL)) {
      // Request Interceptor
      instance.interceptors.request.use((config) => {
        const userInfo = getUserInfoFromLocalStorage()
        if (userInfo?.token) {
          config.headers = config.headers || {}
          config.headers["Authorization"] = `Bearer ${userInfo.token}`
        } else if (config.headers && config.headers["Authorization"]) {
          delete config.headers["Authorization"]
        }
        return config
      })

      // Response Interceptor
      instance.interceptors.response.use(
        (response) => {
          if (
            response?.data &&
            "result" in response.data &&
            "status" in response.data &&
            "code" in response.data
          ) {
            return response.data.result
          }
          return response.data
        },
        (error) => {
          console.log("=======================")
          console.log(error.response.data)
          console.log("=======================")
          if (error.response.data.code === "404") {
            redirect("/error/not-found")
          }
          if (error.response.data.code === "401") {
            redirect("/error/unauthenticated")
          }
          if (error.response.data.code === "403") {
            redirect("/error/unauthorized")
          }
          if (error.response.data.code === "500") {
            redirect("/error/internal-server-error")
          }
          if (error.response.data.code === "503") {
            redirect("/error/service-unavailable")
          }
          
          if (error.response?.data?.message) {
            return Promise.reject(new Error(error.response.data.message))
          }
          return Promise.reject(error)
        }
      )

      AxiosClient.interceptorsAttached.add(baseURL)
    }

    return instance
  }

}

export default AxiosClient
