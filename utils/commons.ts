import { CrawledDataType, FPT_TYPE_LIST, FPTType, STUDENT_TYPE_LIST, StudentType } from "@/const/common"
import { Role } from "@/const/role"
import type { User, UserInfoLocalStorage } from "@/types/user"

export function saveUserInfoIntoLocalStorage(userInfo: UserInfoLocalStorage): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("userInfo", JSON.stringify(userInfo))
  }
}

export function getUserInfoFromLocalStorage(): UserInfoLocalStorage | null {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("userInfo")
    return userInfo ? JSON.parse(userInfo) : null
  }
  return null
}

export function hasRole(user: User, roleName: Role): boolean {
  return Array.from(user.roles).some((role) => role.name === roleName)
}

export function getHighestRole(user: User): string {
  const roles = Array.from(user.roles)

  if (roles.some((role) => role.name === Role.SUPER_ADMIN)) {
    return "Super Admin"
  }
  if (roles.some((role) => role.name === Role.ADMIN)) {
    return "Admin"
  }
  if (roles.some((role) => role.name === Role.OWNER)) {
    return "Admin"
  }
  if (roles.some((role) => role.name === Role.USER)) {
    return "User"
  }

  return "Anonymous"
}

export function formatRoleName(roleName: string): string {
  return roleName
    .replace("ROLE_", "")
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}


export const isFPTType = (value: CrawledDataType): value is FPTType => {
  return FPT_TYPE_LIST.includes(value as FPTType);
}

export const isStudentType = (value: CrawledDataType): value is StudentType => {
  return STUDENT_TYPE_LIST.includes(value as StudentType);
}