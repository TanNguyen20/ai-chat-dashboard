import type { Role } from "./role"

export interface User {
  id: number
  username: string
  isAccountNonExpired: boolean
  isAccountNonLocked: boolean
  isCredentialsNonExpired: boolean
  isEnabled: boolean
  roles: Set<Role>
}

export interface UserInfoLocalStorage {
  token: string
  user?: User
}
