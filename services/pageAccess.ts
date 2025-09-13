import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import type { PageAccess, UpsertPageRequest } from "@/types/pageAccess"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/pages`)

export class PageAccessService {
  static async list(): Promise<PageAccess[]> {
    const res = await api.get("")
    return res
  }

  static async create(data: UpsertPageRequest): Promise<PageAccess> {
    const res = await api.post("", data)
    return res
  }

  static async update(id: number, data: UpsertPageRequest): Promise<PageAccess> {
    const res = await api.put(`/${id}`, data)
    return res
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/${id}`)
  }
}
