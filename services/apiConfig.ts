import { TypedAxiosInstance } from "@/types/axios";
import { getUserInfoFromLocalStorage } from "@/utils/commons"
import axios from "axios"
import qs from "qs"

class AxiosClient {
  private static readonly instances: Map<string, TypedAxiosInstance> = new Map()
  private static readonly interceptorsAttached: Set<string> = new Set()

  private constructor() { }

  public static getInstance(baseURL: string): TypedAxiosInstance  {
    if (!AxiosClient.instances.has(baseURL)) {
      const instance = axios.create({
        baseURL: baseURL,
        timeout: 60000,
        headers: {
          "Content-Type": "application/json",
        },
        paramsSerializer: {
          serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
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
          console.log(error)
          return error
        }
      )

      AxiosClient.interceptorsAttached.add(baseURL)
    }

    return instance
  }

  public static getInstances(): Map<string, TypedAxiosInstance> {
    return AxiosClient.instances
  }

}

export default AxiosClient
