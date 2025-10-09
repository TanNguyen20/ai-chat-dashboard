export type RoleKey = `ROLE_${string}`;
export type CRUD = { create: boolean; read: boolean; update: boolean; delete: boolean };
export type RolePermissions = Record<RoleKey | string, CRUD>;

export interface PageAccess {
  id: number;
  url: string;
  name: string;
  icon: string;
  description: string;
  rolePermissions: RolePermissions;
}

export interface UpsertPageRequest {
  url: string;
  name: string;
  icon: string;
  description: string;
  rolePermissions: RolePermissions;
}

export type CrudKey = "create" | "read" | "update" | "delete"

export type CrudSet = Record<CrudKey, boolean>
