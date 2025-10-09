"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Role } from "@/const/role"
import { useAuth } from "@/contexts/Authentication"
import { usePermission } from "@/contexts/Permission"
import { getHighestRole } from "@/utils/commons"
import { Activity, BarChart3, Clock, MessageSquare, Shield, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { DynamicIcon } from "@/components/DynamicIcon"

// --- Types (use your shared ones if you already export them) ---
type CrudKey = "create" | "read" | "update" | "delete"
type RoleKey = `ROLE_${string}`
type CRUD = { create: boolean; read: boolean; update: boolean; delete: boolean }
type RolePermissions = Record<RoleKey | string, CRUD>
interface PageAccess {
  id: number
  url: string
  name: string
  icon: string
  description: string
  rolePermissions: RolePermissions
}

// deterministic color so cards look nice without backend color
const COLORS = ["bg-blue-500","bg-green-500","bg-purple-500","bg-orange-500","bg-red-500","bg-amber-500","bg-teal-500"]
const pickColor = (id: number) => COLORS[id % COLORS.length]

// permission helper
function hasPermissionOnPage({
  page,
  userRoles,
  crud = "read",
}: {
  page: PageAccess
  userRoles: Role[]
  crud?: CrudKey
}) {
  if (!page?.rolePermissions) return false
  return userRoles.some((role) => Boolean(page.rolePermissions[role as RoleKey]?.[crud]))
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { pages } = usePermission()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    )
  }
  if (!user) return null

  const userRoles: Role[] = useMemo(() => {
    if (!user?.roles) return []
    return Array.from(user.roles).map((r: any) => r.name as Role)
  }, [user])

  // Build dynamic services from backend
  const services = useMemo(() => {
    const list = (pages ?? []) as PageAccess[]
    const filtered = list.filter((p) => !p.url.includes("[")) // hide dynamic detail routes in the grid
    return filtered.map((p) => ({
      id: p.id,
      title: p.name || p.url,
      description: p.description,
      iconName: p.icon,            // <— keep the raw string from backend
      href: p.url,
      color: pickColor(p.id),
      page: p,
    }))
  }, [pages])

  const availableServices = useMemo(
    () => services.filter((svc) => hasPermissionOnPage({ page: svc.page, userRoles, crud: "read" })),
    [services, userRoles]
  )

  const canReadUrl = (url: string) => {
    const page = (pages ?? []).find((p) => p.url === url)
    if (!page) return false
    return hasPermissionOnPage({ page, userRoles, crud: "read" })
  }

  return (
    <div className="container space-y-8 p-3 sm:p-4">
      {/* Welcome */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.username}!</h1>
        <p className="text-muted-foreground">Here's an overview of your available services and recent activity.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableServices.length}</div>
            <p className="text-xs text-muted-foreground">Available to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user && getHighestRole(user)}</div>
            <p className="text-xs text-muted-foreground">Current access level</p>
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Available Services</h2>
          <Badge variant="secondary">{availableServices.length} services</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableServices.map((service) => (
            <Card key={service.href} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${service.color} text-white group-hover:scale-110 transition-transform`}>
                    <DynamicIcon name={service.iconName} className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={service.href}>
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    Access {service.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {canReadUrl("/analytics") && (
            <Link href="/analytics">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <BarChart3 className="h-4 w-4" />
                <span>View Analytics</span>
              </Button>
            </Link>
          )}
          {canReadUrl("/users") && (
            <Link href="/users">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Users className="h-4 w-4" />
                <span>Manage Users</span>
              </Button>
            </Link>
          )}
          {canReadUrl("/chatbot") && (
            <Link href="/chatbot">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <MessageSquare className="h-4 w-4" />
                <span>Configure Chatbot</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
