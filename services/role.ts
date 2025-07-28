import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import type { Role } from "@/types/role"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/roles`)

export class RoleService {
  static async getAllRole(): Promise<Array<Role>> {
    const response = await api.get("")
    return response.data
  }
}
