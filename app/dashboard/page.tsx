"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { UserService } from "@/services/user"
import { RoleService } from "@/services/role"
import type { User } from "@/types/user"
import type { Role } from "@/types/role"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { LogoutConfirmation } from "@/components/logout-confirmation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  UserCheck,
  UserX,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Settings,
  UserCog,
  Bot,
} from "lucide-react"
import { hasRole, formatRoleName, getHighestRole } from "@/utils/commons"

interface NewUser {
  username: string
  email: string
  password: string
  roles: string[]
}

interface EditUser {
  id: number
  username: string
  email: string
  roles: string[]
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    isActive: true,
  },
  {
    title: "User Management",
    icon: Users,
    href: "/dashboard",
    isActive: false,
  },
  {
    title: "Chatbot",
    icon: Bot,
    href: "/chatbot",
    isActive: false,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "#",
    isActive: false,
  },
  {
    title: "Security",
    icon: Shield,
    href: "#",
    isActive: false,
  },
  {
    title: "Settings",
    icon: Settings,
    href: "#",
    isActive: false,
  },
]

function AppSidebar({
  showLogoutDialog,
  setShowLogoutDialog,
}: {
  showLogoutDialog: boolean
  setShowLogoutDialog: (show: boolean) => void
}) {
  const { user: currentUser } = useAuth()

  const displayRole = currentUser ? getHighestRole(currentUser) : "USER"

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin Panel</span>
            <span className="truncate text-xs text-muted-foreground">Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  >
                    <a href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {currentUser?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-left text-sm">
            <div className="font-medium">{currentUser?.username}</div>
            <div className="text-xs text-muted-foreground">
              <Badge
                variant={displayRole === "SUPER_ADMIN" || displayRole === "ADMIN" ? "default" : "secondary"}
                className="text-xs"
              >
                {displayRole}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogoutDialog(true)}
            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    email: "",
    password: "",
    roles: ["ROLE_USER"],
  })
  const [editUser, setEditUser] = useState<EditUser>({
    id: 0,
    username: "",
    email: "",
    roles: [],
  })
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const userData = await UserService.getAllUser()
      setUsers(userData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const roleData = await RoleService.getAllRole()
      setRoles(roleData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async () => {
    try {
      await UserService.createUser(newUser)
      setNewUser({ username: "", email: "", password: "", roles: ["ROLE_USER"] })
      setIsAddDialogOpen(false)
      fetchUsers()
      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    try {
      await UserService.updateUser(editUser.id, {
        username: editUser.username,
        email: editUser.email,
        roles: editUser.roles,
      })
      setIsEditDialogOpen(false)
      fetchUsers()
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (user?.id === userId) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      })
      return
    }

    try {
      await UserService.deleteUser(userId)
      fetchUsers()
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUserRoles = async () => {
    if (!selectedUser) return

    try {
      await UserService.updateUserRoles(selectedUser.id, selectedRoles)
      setIsRoleDialogOpen(false)
      setSelectedUser(null)
      setSelectedRoles([])
      fetchUsers()
      toast({
        title: "Success",
        description: "User roles updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: User) => {
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.username, // Assuming email is same as username for now
      roles: Array.from(user.roles).map((role) => role.name),
    })
    setIsEditDialogOpen(true)
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setSelectedRoles(Array.from(user.roles).map((role) => role.name))
    setIsRoleDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      await logout()
    } catch (error) {
      // Error handling is done in AuthProvider
    } finally {
      setLogoutLoading(false)
      setIsLogoutDialogOpen(false)
    }
  }

  const handleRoleChange = (roleName: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, roleName])
    } else {
      setSelectedRoles((prev) => prev.filter((role) => role !== roleName))
    }
  }

  const getUserRoleBadges = (userRoles: Set<Role>) => {
    return Array.from(userRoles).map((role) => (
      <Badge key={role.id} variant={role.name.includes("ADMIN") ? "default" : "secondary"} className="text-xs">
        {formatRoleName(role.name)}
      </Badge>
    ))
  }

  const getStats = () => {
    const totalUsers = users.length
    const adminUsers = users.filter((user) => Array.from(user.roles).some((role) => role.name.includes("ADMIN"))).length
    const regularUsers = totalUsers - adminUsers

    return { totalUsers, adminUsers, regularUsers }
  }

  const { totalUsers, adminUsers, regularUsers } = getStats()
  const isSuperAdmin = user && hasRole(user, "ROLE_SUPER_ADMIN")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar showLogoutDialog={isLogoutDialogOpen} setShowLogoutDialog={setIsLogoutDialogOpen} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>User Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regularUsers}</div>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage users and their permissions</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Create a new user account with specified roles.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newUser.roles[0]}
                          onValueChange={(value) => setNewUser({ ...newUser, roles: [value] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {formatRoleName(role.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddUser}>Create User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">{getUserRoleBadges(user.roles)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isEnabled ? "default" : "destructive"}>
                          {user.isEnabled ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && (
                            <Button variant="outline" size="sm" onClick={() => openRoleDialog(user)}>
                              <UserCog className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and roles.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>Select roles for {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={role.name}
                  checked={selectedRoles.includes(role.name)}
                  onCheckedChange={(checked) => handleRoleChange(role.name, checked as boolean)}
                />
                <Label htmlFor={role.name} className="flex items-center gap-2">
                  <Badge variant={role.name.includes("ADMIN") ? "default" : "secondary"}>
                    {formatRoleName(role.name)}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateUserRoles}>Update Roles</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogout}
        loading={logoutLoading}
      />
    </SidebarProvider>
  )
}
