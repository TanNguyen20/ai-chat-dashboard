"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { LogoutConfirmation } from "@/components/logout-confirmation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

const breadcrumbMap: Record<string, { title: string; href?: string }[]> = {
  "/dashboard": [{ title: "Dashboard", href: "/dashboard" }, { title: "Overview" }],
  "/chatbot": [{ title: "Dashboard", href: "/dashboard" }, { title: "Chatbot" }],
  "/users": [{ title: "Dashboard", href: "/dashboard" }, { title: "Users" }],
  "/analytics": [{ title: "Dashboard", href: "/dashboard" }, { title: "Analytics" }],
  "/roles": [{ title: "Dashboard", href: "/dashboard" }, { title: "Roles" }],
  "/settings": [{ title: "Dashboard", href: "/dashboard" }, { title: "Settings" }],
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLogoutLoading(false)
      setShowLogoutDialog(false)
    }
  }

  const getBreadcrumbs = () => {
    return breadcrumbMap[pathname] || [{ title: "Dashboard", href: "/dashboard" }, { title: "Page" }]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider>
      <AppSidebar showLogoutDialog={showLogoutDialog} setShowLogoutDialog={setShowLogoutDialog} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1">{children}</main>
      </SidebarInset>

      <LogoutConfirmation
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        loading={logoutLoading}
      />
    </SidebarProvider>
  )
}
