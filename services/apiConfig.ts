import { getUserInfoFromLocalStorage } from "@/utils/commons"
import axios, { type AxiosInstance } from "axios"

class AxiosClient {
  private static instances: Map<string, AxiosInstance> = new Map()
  private static interceptorsAttached: Set<string> = new Set()

  private constructor() {}

  public static getInstance(baseURL: string): AxiosInstance {
    if (!AxiosClient.instances.has(baseURL)) {
      const instance = axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      })
      AxiosClient.instances.set(baseURL, instance)
    }

    const instance = AxiosClient.instances.get(baseURL)!

    // Attach interceptor only once per instance
    if (!AxiosClient.interceptorsAttached.has(baseURL)) {
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
      AxiosClient.interceptorsAttached.add(baseURL)
    }

    return instance
  }
}

export default AxiosClient
