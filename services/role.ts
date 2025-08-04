import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import type { Role, CreateRole } from "@/types/role"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/roles`)

export class RoleService {
  static async getAllRole(): Promise<Array<Role>> {
    const response = await api.get("")
    return response
  }

  static async createRole(data: CreateRole): Promise<Role> {
    const response = await api.post("/create", data)
    return response
  }

  static async deleteRole(id: number): Promise<void> {
    await api.delete(`/delete?id=${id}`)
  }
}
