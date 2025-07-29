import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/auth`)

export class AuthService {
  static async login(username: string, password: string): Promise<{ token: string }> {
    const response = await api.post("/login", {
      username,
      password,
    })
    return response.data
  }

  static async register(username: string, password: string, email?: string): Promise<{ token: string }> {
    const response = await api.post("/register", {
      username,
      password,
      email,
    })
    return response.data
  }

  static async logout(): Promise<void> {
    try {
      await api.post("/logout")
    } catch (error) {
      // Even if the API call fails, we should still clear local storage
      console.warn("Logout API call failed, but continuing with local cleanup:", error)
    }
  }
}
