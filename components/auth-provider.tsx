"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthService } from "@/services/auth"
import { UserService } from "@/services/user"
import type { User, UserInfoLocalStorage } from "@/types/user"
import {
  saveUserInfoIntoLocalStorage,
  getUserInfoFromLocalStorage,
  clearUserInfoFromLocalStorage,
} from "@/utils/commons"

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string, email?: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for existing session and validate token
    const initializeAuth = async () => {
      try {
        const savedUserInfo = getUserInfoFromLocalStorage()
        if (savedUserInfo?.token) {
          // Validate token by fetching current user
          const currentUser = await UserService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        // Token is invalid, clear localStorage
        clearUserInfoFromLocalStorage()
        console.error("Token validation failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    // Redirect logic
    const publicPaths = ["/login", "/register"]
    const isPublicPath = publicPaths.includes(pathname)

    if (!isLoading) {
      if (!user && !isPublicPath) {
        router.push("/login")
      } else if (user && isPublicPath) {
        router.push("/dashboard")
      }
    }
  }, [user, pathname, router, isLoading])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null)
      setIsLoading(true)

      const authResponse = await AuthService.login(username, password)

      // Save token to localStorage
      const userInfo: UserInfoLocalStorage = {
        token: authResponse.token,
      }
      saveUserInfoIntoLocalStorage(userInfo)

      // Fetch current user details
      const currentUser = await UserService.getCurrentUser()
      setUser(currentUser)

      return true
    } catch (error: any) {
      console.error("Login failed:", error)
      setError(error.response?.data?.message || "Login failed. Please check your credentials.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, password: string, email?: string): Promise<boolean> => {
    try {
      setError(null)
      setIsLoading(true)

      const authResponse = await AuthService.register(username, password, email)

      // Save token to localStorage
      const userInfo: UserInfoLocalStorage = {
        token: authResponse.token,
      }
      saveUserInfoIntoLocalStorage(userInfo)

      // Fetch current user details
      const currentUser = await UserService.getCurrentUser()
      setUser(currentUser)

      return true
    } catch (error: any) {
      console.error("Registration failed:", error)
      setError(error.response?.data?.message || "Registration failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)

      // Call the logout API endpoint
      await AuthService.logout()
    } catch (error) {
      console.error("Logout API call failed:", error)
      // Continue with logout even if API call fails
    } finally {
      // Clear user state and localStorage
      setUser(null)
      clearUserInfoFromLocalStorage()
      setError(null)
      setIsLoading(false)

      // Redirect to login page
      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>{children}</AuthContext.Provider>
  )
}
