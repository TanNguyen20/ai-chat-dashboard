import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import type { User } from "@/types/user"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/users`)

export class UserService {
  static async getAllUser(): Promise<Array<User>> {
    const response = await api.get("")
    return response
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get("/me")
    return response
  }

  static async createUser(userData: {
    username: string
    email: string
    password: string
    roles: string[]
  }): Promise<User> {
    const response = await api.post("", userData)
    return response
  }

  static async updateUser(
    userId: number,
    userData: {
      username?: string
      email?: string
      roles?: string[]
    },
  ): Promise<User> {
    const response = await api.put(`/${userId}`, userData)
    return response
  }

  static async deleteUser(userId: number): Promise<void> {
    await api.delete(`/${userId}`)
  }

  static async updateUserRoles(userId: number, roles: string[]): Promise<User> {
    const response = await api.post(`/${userId}/roles`, { roles })
    return response
  }
}
