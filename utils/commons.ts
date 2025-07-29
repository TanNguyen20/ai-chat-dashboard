import type { User } from "@/types/user"
import type { Role } from "@/types/role"

export const saveUserInfoIntoLocalStorage = (user: User): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export const getUserInfoFromLocalStorage = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
        return null
      }
    }
  }
  return null
}

export const removeUserInfoFromLocalStorage = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

export const hasRole = (user: User, roleName: string): boolean => {
  if (!user || !user.roles) return false

  const rolesArray = Array.from(user.roles)
  return rolesArray.some((role: Role) => role.name === roleName)
}

export const formatRoleName = (roleName: string): string => {
  return roleName
    .replace("ROLE_", "")
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export const getHighestRole = (user: User): string => {
  if (!user || !user.roles || user.roles.size === 0) return "USER"

  const rolesArray = Array.from(user.roles)
  if (rolesArray.some((role: Role) => role.name === "ROLE_SUPER_ADMIN")) return "SUPER_ADMIN"
  if (rolesArray.some((role: Role) => role.name === "ROLE_ADMIN")) return "ADMIN"
  if (rolesArray.some((role: Role) => role.name === "ROLE_OWNER")) return "OWNER"
  return "USER"
}
