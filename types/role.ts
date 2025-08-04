import type { Role as EnumRole } from "@/const/role"

export type Role = {
  id: number
  name: EnumRole
  description?: string
  createdAt?: string
  updatedAt?: string
}


export interface CreateRole {
  name: string
  description?: string
}
