import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import type { AnalyticsConfig, CreateAnalyticsConfig, UpdateAnalyticsConfig } from "@/types/analyticsConfig"
import { Page, PaginationRequestParams } from "@/types/pagination"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/analytics-config`)

export class AnalyticsConfigService {
  static async getAllAnalyticsConfig(): Promise<Array<AnalyticsConfig>> {
    const response = await api.get("")
    return response
  }
  
  static async getAnalyticsConfigPagination(params: PaginationRequestParams): Promise<Page<AnalyticsConfig>> {
    const response = await api.get("/pagination", { params })
    return response
  }

  static async getAnalyticsConfig(id: number): Promise<AnalyticsConfig> {
    const response = await api.get(`/${id}`)
    return response
  }

  static async createAnalyticsConfig(data: CreateAnalyticsConfig): Promise<AnalyticsConfig> {
    const response = await api.post("", data)
    return response
  }

  static async updateAnalyticsConfig(id: number, data: UpdateAnalyticsConfig): Promise<AnalyticsConfig> {
    const response = await api.put(`/${id}`, data)
    return response
  }

  static async deleteAnalyticsConfig(id: number): Promise<void> {
    await api.delete(`/${id}`)
  }
}
