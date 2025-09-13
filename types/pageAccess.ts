export type CrudKey = "create" | "read" | "update" | "delete"
export type CrudSet = Record<CrudKey, boolean>

/** Maps role name (e.g. "ROLE_ADMIN") -> CRUD flags */
export type RolePermissions = Record<string, CrudSet>

export interface PageAccess {
  id: number
  url: string
  description: string
  rolePermissions: RolePermissions
}

export interface UpsertPageRequest {
  url: string
  description: string
  rolePermissions: RolePermissions
}
