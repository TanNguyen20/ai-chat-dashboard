import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import type { User, UserInfoRequest } from "@/types/user"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/users`)

export class UserService {
  static async getAllUser(): Promise<Array<User>> {
    const response = await api.get("")
    return response
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get("/me")
      return response
    }
    catch (error) {
      return Promise.reject(error)
    }
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

  static async updateUserInfo(userId: number, data: UserInfoRequest): Promise<void> {
    const response = await api.put(`/${userId}`, data)
    return response
  }
}
