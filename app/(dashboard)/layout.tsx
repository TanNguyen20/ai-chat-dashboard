"use client"

import { AppSidebar, navigationItems } from "@/components/app-sidebar"
import Loading from "@/components/loading"
import { LogoutConfirmation } from "@/components/logout-confirmation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/Authentication"
import { getUserInfoFromLocalStorage } from "@/utils/commons"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useMemo, useState } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const hasToken = useMemo(() => {
    try {
      return !!getUserInfoFromLocalStorage()?.token
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    // Redirect only when we KNOW there’s no user and no token and not loading
    if (!isLoading && !user && !hasToken) {
      router.push("/login")
    }
  }, [user, isLoading, hasToken, router])

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      await logout()
    } finally {
      setLogoutLoading(false)
      setShowLogoutDialog(false)
    }
  }

  const breadcrumbs =
    navigationItems.find((item) => item.url === pathname)?.breadcrumb || [
      { title: "Dashboard", href: "/" },
      { title: "Page" },
    ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  // If no user but we DO have a token, let the page render a loader while the provider finishes /me
  if (!user && hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  if (!user) {
    // No user and no token; the effect above will navigate away
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar showLogoutDialog={showLogoutDialog} setShowLogoutDialog={setShowLogoutDialog} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 justify-between items-center">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {crumb.href ? <Link href={crumb.href}>{crumb.title}</Link> : <BreadcrumbPage>{crumb.title}</BreadcrumbPage>}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 h-[calc(100vh-4rem)] overflow-auto">{children}</main>
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
