import type { Role } from "./role"

export interface User {
  id: number
  username: string
  accountNonExpired: boolean
  accountNonLocked: boolean
  credentialsNonExpired: boolean
  enabled: boolean
  roles: Array<Role>
  fullName: string
  email: string
  createdAt: string
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


export interface UserProfileInfo {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
}

export interface UserProfileInfoRequest {
  email: string;
  fullName: string;
}