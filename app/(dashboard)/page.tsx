"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Settings, MessageSquare, Users, Shield, TrendingUp, Activity, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useEffect } from "react"
import { Role } from "@/const/role"
import { getHighestRole } "@utils/commons"

const services = [
  {
    title: "Analytics",
    description: "View and manage your analytics dashboards",
    icon: BarChart3,
    href: "/analytics",
    color: "bg-blue-500",
    requiredRoles: [Role.ADMIN, Role.SUPER_ADMIN, Role.OWNER],
  },
  {
    title: "Analytics Configuration",
    description: "Configure analytics settings and connections",
    icon: Settings,
    href: "/analytics-config",
    color: "bg-green-500",
    requiredRoles: [Role.ADMIN, Role.SUPER_ADMIN, Role.OWNER],
  },
  {
    title: "Chatbot Management",
    description: "Manage your AI chatbot configurations",
    icon: MessageSquare,
    href: "/chatbot",
    color: "bg-purple-500",
    requiredRoles: [Role.ADMIN, Role.SUPER_ADMIN, Role.OWNER],
  },
  {
    title: "User Management",
    description: "Manage users and their permissions",
    icon: Users,
    href: "/users",
    color: "bg-orange-500",
    requiredRoles: [Role.ADMIN, Role.SUPER_ADMIN, Role.OWNER],
  },
  {
    title: "Role Management",
    description: "Configure roles and permissions",
    icon: Shield,
    href: "/roles",
    color: "bg-red-500",
    requiredRoles: [Role.SUPER_ADMIN, Role.OWNER],
  },
]

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const hasRequiredRole = (requiredRoles: Role[]) => {
    if (!user?.roles) return false
    const userRoles = Array.from(user.roles).map((role) => role.name)
    return requiredRoles.some((requiredRole) => userRoles.includes(requiredRole))
  }
  
  const availableServices = services.filter((service) => hasRequiredRole(service.requiredRoles))

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
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
            <div className="text-2xl font-bold">{getHighestRole()}</div>
            <p className="text-xs text-muted-foreground">Current access level</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Available Services</h2>
          <Badge variant="secondary">{availableServices.length} services</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableServices.map((service) => {
            const Icon = service.icon
            return (
              <Card key={service.href} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${service.color} text-white group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
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
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {hasRequiredRole([Role.ADMIN, Role.SUPER_ADMIN, Role.OWNER]) && (
            <Link href="/analytics">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <BarChart3 className="h-4 w-4" />
                <span>View Analytics</span>
              </Button>
            </Link>
          )}
          {hasRequiredRole([Role.ADMIN, Role.SUPER_ADMIN, Role.OWNER]) && (
            <Link href="/users">
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Users className="h-4 w-4" />
                <span>Manage Users</span>
              </Button>
            </Link>
          )}
          {hasRequiredRole([Role.ADMIN, Role.SUPER_ADMIN, Role.OWNER]) && (
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
