"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, Bot, Users, Shield, Settings, LogOut, ChevronUp, User, BarChart3, Settings2Icon } from "lucide-react"
import { hasRole, getHighestRole } from "@/utils/commons"
import Link from "next/link"
import { Role } from "@/const/role"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  showLogoutDialog: boolean
  setShowLogoutDialog: (show: boolean) => void
}

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    title: "Chatbot",
    url: "/chatbot",
    icon: Bot,
    roles: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    title: "Analytics Config",
    url: "/analytics-config",
    icon: Settings2Icon,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    title: "Roles",
    url: "/roles",
    icon: Shield,
    roles: [Role.SUPER_ADMIN],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
]

export function AppSidebar({ showLogoutDialog, setShowLogoutDialog, ...props }: AppSidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  const filteredNavItems = navigationItems.filter((item) => item.roles.some((role) => user && hasRole(user, role)))

  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Dashboard</span>
                  <span className="truncate text-xs">Management System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.username} />
                    <AvatarFallback className="rounded-lg">
                      {user ? getUserInitials(user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.username}</span>
                    <span className="truncate text-xs">{user ? getHighestRole(user) : "User"}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
