import AxiosClient from "./apiConfig"
import { BASE_URL } from "@/const/api"

export interface Chatbot {
  id: string
  name: string
  allowedHost: string
  themeColor: string
  createdAt: string
  updatedAt: string
  apiKey: string
}

export interface ChatbotRequest {
  name: string
  allowedHost: string
  themeColor: string
}

const api = AxiosClient.getInstance(`${BASE_URL.AI_CHAT_SERVICE}/chatbot`)

export class ChatbotService {
  static async createChatbot(data: ChatbotRequest): Promise<Chatbot> {
    const response = await api.post("", data)
    return response
  }

  static async getChatbotList(): Promise<Chatbot[]> {
    const response = await api.get("/config-info")
    return response
  }

  static async getChatbotById(id: string): Promise<Chatbot> {
    const response = await api.get(`/${id}`)
    return response
  }

  static async updateChatbot(id: string, data: Partial<ChatbotRequest>): Promise<Chatbot> {
    const response = await api.put(`/${id}`, data)
    return response
  }

  static async deleteChatbot(id: string): Promise<void> {
    await api.delete(`/${id}`)
  }
}
