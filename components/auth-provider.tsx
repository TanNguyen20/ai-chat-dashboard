"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/services/auth"
import { UserService } from "@/services/user"
import { saveUserInfoIntoLocalStorage, getUserInfoFromLocalStorage } from "@/utils/commons"
import type { User, UserInfoLocalStorage } from "@/types/user"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const userInfo = getUserInfoFromLocalStorage()
      if (userInfo?.token) {
        const currentUser = await UserService.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem("userInfo")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await AuthService.login(username, password)
      const userInfo: UserInfoLocalStorage = { token: response.token }
      saveUserInfoIntoLocalStorage(userInfo)

      const currentUser = await UserService.getCurrentUser()
      setUser(currentUser)
      router.push("/dashboard")
    } catch (error) {
      throw error
    }
  }

  const register = async (username: string, password: string, email: string) => {
    try {
      const response = await AuthService.register(username, password, email)
      const userInfo: UserInfoLocalStorage = { token: response.token }
      saveUserInfoIntoLocalStorage(userInfo)

      const currentUser = await UserService.getCurrentUser()
      setUser(currentUser)
      router.push("/dashboard")
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.warn("Logout API call failed:", error)
    } finally {
      localStorage.removeItem("userInfo")
      setUser(null)
      router.push("/login")
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
