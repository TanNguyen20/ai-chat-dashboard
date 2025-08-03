import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import { SupersetToken } from "@/types/analytics"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/superset`)

export class SupersetService {
  static async getGuestToken(dashboardId: string, analyticsConfigId: number): Promise<SupersetToken> {
    const response = await api.get("", { params: { dashboardId, analyticsConfigId } })
    return response
  }
}