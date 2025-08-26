export const BASE_URL = {
  AI_CHAT_SERVICE: process.env.NEXT_PUBLIC_AI_CHAT_SERVICE_BASE_URL || "http://localhost:8080/api/v1",
  AI_CORE_SERVICE: process.env.NEXT_PUBLIC_AI_CORE_SERVICE_BASE_URL || "http://localhost:8088/api/v1",
  CRAWL_SERVICE: process.env.NEXT_PUBLIC_CRAWL_SERVICE_BASE_URL || "http://localhost:8089/api/v1",
}
