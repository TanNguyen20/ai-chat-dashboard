import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import { AnalyticsDashboard, CreateAnalyticsDashboard } from "@/types/analytics"
import { Page, PaginationRequestParams } from "@/types/pagination"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/analytics`)

export class AnalyticsService {
  static async getAllAnalyticsDashboard(): Promise<Array<AnalyticsDashboard>> {
    const response = await api.get("")
    return response
  }

  static async getAnalyticsDashboardPagination(params: PaginationRequestParams): Promise<Page<AnalyticsDashboard>> {
    const response = await api.get("", { params })
    return response
  }

  static async createAnalyticsDashboard(data: CreateAnalyticsDashboard): Promise<void> {
    const response = await api.post("", data)
    return response
  }

  static async deleteAnalyticsDashboard(id: number): Promise<void> {
    await api.delete(`/${id}`)
  }

  static async getAnalyticsDashboard(id: number): Promise<AnalyticsDashboard> {
    const response = await api.get(`/${id}`)
    return response
  }

  static async updateAnalyticsDashboard(
    id: number,
    data: Partial<CreateAnalyticsDashboard>,
  ): Promise<AnalyticsDashboard> {
    const response = await api.put(`/${id}`, data)
    return response
  }
}
