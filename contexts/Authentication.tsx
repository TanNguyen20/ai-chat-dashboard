"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthService } from "@/services/auth"
import { UserService } from "@/services/user"
import { saveUserInfoIntoLocalStorage, getUserInfoFromLocalStorage } from "@/utils/commons"
import type { User, UserInfoLocalStorage } from "@/types/user"
import { toast } from "sonner"

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
  const pathname = usePathname()

  const checkAuthStatus = async () => {
    try {
      const userInfo = getUserInfoFromLocalStorage()
      if (userInfo?.token) {
        const currentUser = await UserService.getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch {
      // Only clear if we’re not on the callback route
      if (!pathname?.startsWith("/auth/callback")) {
        localStorage.removeItem("userInfo")
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // On route change, run the check (but skip /auth/callback)
  useEffect(() => {
    if (pathname?.startsWith("/auth/callback")) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)           // <-- important: mark as loading before async check
    checkAuthStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Listen for the callback page to announce token saved
  useEffect(() => {
    const onAuthUpdated = () => {
      setIsLoading(true)
      checkAuthStatus()
    }
    window.addEventListener("auth-updated", onAuthUpdated as EventListener)
    return () => window.removeEventListener("auth-updated", onAuthUpdated as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (username: string, password: string) => {
    const response = await AuthService.login(username, password)
    const userInfo: UserInfoLocalStorage = { token: response.token }
    saveUserInfoIntoLocalStorage(userInfo)
    setIsLoading(true)
    const currentUser = await UserService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
    router.push("/")
  }

  const register = async (username: string, password: string, email: string) => {
    await AuthService.register(username, password, email)
    toast.success("User registered successfully")
    router.push("/login")
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
