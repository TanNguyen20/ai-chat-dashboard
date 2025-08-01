import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import { UserToken } from "@/types/auth"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/auth`)

export class AuthService {
  static async login(username: string, password: string): Promise<UserToken> {
    const response = await api.post("/login", {
      username,
      password,
    })
    return response
  }

  static async register(username: string, password: string, email: string): Promise<void> {
    const response = await api.post("/register", {
      username,
      password,
      email,
    })
    return response
  }

  static async logout(): Promise<void> {
    try {
      await api.post("/logout")
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error)
    }
  }
}
