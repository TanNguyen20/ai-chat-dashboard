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

export function hasRole(user: User, roleName: string): boolean {
  return Array.from(user.roles).some((role) => role.name === roleName)
}

export function getHighestRole(user: User): string {
  const roles = Array.from(user.roles)

  if (roles.some((role) => role.name === "ROLE_SUPER_ADMIN")) {
    return "Super Admin"
  }
  if (roles.some((role) => role.name === "ROLE_ADMIN")) {
    return "Admin"
  }
  if (roles.some((role) => role.name === "ROLE_USER")) {
    return "User"
  }

  return "User"
}

export function formatRoleName(roleName: string): string {
  return roleName
    .replace("ROLE_", "")
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
