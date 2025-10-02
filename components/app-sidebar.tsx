"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

import { useAuth } from "@/contexts/Authentication";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { usePermission } from "@/contexts/Permission";
import { getHighestRole } from "@/utils/commons";
import {
  BarChart3,
  Bot,
  ChevronUp,
  Database,
  LayoutDashboard,
  LogOut,
  Pickaxe,
  Settings,
  Settings2Icon,
  Shield,
  TrendingUpDown,
  User,
  Users,
} from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  showLogoutDialog: boolean;
  setShowLogoutDialog: (show: boolean) => void;
}

export const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Overview" }],
  },
  {
    title: "Chatbot",
    url: "/chatbot",
    icon: Bot,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Chatbot" }],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Users" }],
  },
  {
    title: "Analytics Config",
    url: "/analytics-config",
    icon: Settings2Icon,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Analytics Config" }],
  },
  {
    title: "Stock Forecast",
    url: "/stock",
    icon: TrendingUpDown,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Stock Forecast" }],
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Users" }],
  },
  {
    title: "Roles",
    url: "/roles",
    icon: Shield,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Roles" }],
  },
  {
    title: "Crawled Data",
    url: "/crawled-data",
    icon: Database,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Crawled Data" }],
  },
  {
    title: "Crawl System",
    url: "/crawling",
    icon: Pickaxe,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Crawl System" }],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    breadcrumb: [{ title: "Dashboard", href: "/" }, { title: "Settings" }],
  },
];

export function AppSidebar({ showLogoutDialog, setShowLogoutDialog, ...props }: AppSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const { canRead, isChecking } = usePermission();

  // Hide items while permissions are still resolving (optional)
  const filteredNavItems = isChecking
    ? []
    : navigationItems.filter((item) => canRead(item.url));

  const getUserInitials = (username: string) =>
    username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={handleNavClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Dashboard</span>
                  <span className="truncate text-xs">Management System</span>
                </div>
              </Link>
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
                    <Link href={item.url} onClick={handleNavClick}>
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
  );
}
