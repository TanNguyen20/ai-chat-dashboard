import type { UserInfoLocalStorage } from "@/types/user"

export const saveUserInfoIntoLocalStorage = (userInfo: UserInfoLocalStorage) => {
  localStorage.setItem("userInfo", JSON.stringify(userInfo))
}

export const getUserInfoFromLocalStorage = (): UserInfoLocalStorage | null => {
  const userInfo = localStorage.getItem("userInfo")
  return userInfo ? JSON.parse(userInfo) : null
}

export const clearUserInfoFromLocalStorage = () => {
  localStorage.removeItem("userInfo")
}
