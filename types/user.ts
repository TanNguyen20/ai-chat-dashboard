import type { Role } from "./role"

export interface User {
  id: number
  username: string
  accountNonExpired: boolean
  accountNonLocked: boolean
  credentialsNonExpired: boolean
  enabled: boolean
  roles: Array<Role>
}

export interface UserInfoLocalStorage {
  token: string
  user?: User
}

export interface UserInfoRequest {
  isAccountNonExpired: boolean,
  isAccountNonLocked: boolean,
  isCredentialsNonExpired: boolean,
  isEnabled: boolean
}