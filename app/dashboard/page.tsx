"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Trash2, Edit, Plus, LogOut, Users, UserPlus, Home, Settings, BarChart3, Shield } from "lucide-react"
import { UserService } from "@/services/user"
import type { User } from "@/types/user"

// Remove the local User type definition since we're importing it from types

// Navigation items for the sidebar
const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "#",
    isActive: false,
  },
  {
    title: "User Management",
    icon: Users,
    url: "#",
    isActive: true,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "#",
    isActive: false,
  },
  {
    title: "Security",
    icon: Shield,
    url: "#",
    isActive: false,
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
    isActive: false,
  },
]

function AppSidebar() {
  const { user: currentUser, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin Panel</span>
            <span className="truncate text-xs text-sidebar-foreground/70">Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <Users className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{currentUser?.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  <Badge variant={currentUser?.role === "admin" ? "default" : "secondary"} className="text-xs">
                    {currentUser?.role}
                  </Badge>
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="ml-auto size-8 p-0" title="Logout">
                <LogOut className="size-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function DashboardPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", role: "user" as "admin" | "user" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Replace the mock data useEffect with:
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await UserService.getAllUser()
        // Convert Set<Role> to array for easier handling in UI
        const usersWithArrayRoles = fetchedUsers.map((user) => ({
          ...user,
          roles: Array.from(user.roles),
        }))
        setUsers(usersWithArrayRoles)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setError("Failed to load users")
      }
    }

    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) {
      setError("Please fill in all fields")
      return
    }

    try {
      const newUser = await UserService.createUser({
        username: formData.name,
        password: "defaultPassword123", // You might want to add a password field
        email: formData.email,
      })

      const userWithArrayRoles = {
        ...newUser,
        roles: Array.from(newUser.roles),
      }

      setUsers([...users, userWithArrayRoles])
      setFormData({ name: "", email: "", role: "user" })
      setIsAddDialogOpen(false)
      setSuccess("User added successfully")
      setError("")
    } catch (error: any) {
      console.error("Failed to add user:", error)
      setError(error.response?.data?.message || "Failed to add user")
    }
  }

  const handleEditUser = async () => {
    if (!editingUser || !formData.name || !formData.email) {
      setError("Please fill in all fields")
      return
    }

    try {
      const updatedUser = await UserService.updateUser(editingUser.id, {
        username: formData.name,
        // Add other fields as needed based on your API
      })

      const userWithArrayRoles = {
        ...updatedUser,
        roles: Array.from(updatedUser.roles),
      }

      setUsers(users.map((u) => (u.id === editingUser.id ? userWithArrayRoles : u)))
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setFormData({ name: "", email: "", role: "user" })
      setSuccess("User updated successfully")
      setError("")
    } catch (error: any) {
      console.error("Failed to update user:", error)
      setError(error.response?.data?.message || "Failed to update user")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (userId === currentUser?.id) {
      setError("You cannot delete your own account")
      return
    }

    try {
      await UserService.deleteUser(userId)
      setUsers(users.filter((u) => u.id !== userId))
      setSuccess("User deleted successfully")
      setError("")
    } catch (error: any) {
      console.error("Failed to delete user:", error)
      setError(error.response?.data?.message || "Failed to delete user")
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({ name: user.username, email: user.email, role: "user" })
    setIsEditDialogOpen(true)
    setError("")
  }

  const openAddDialog = () => {
    setFormData({ name: "", email: "", role: "user" })
    setIsAddDialogOpen(true)
    setError("")
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold">User Management</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-4 p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.roles && u.roles.some((role) => role.name.includes("ADMIN"))).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => !u.roles || u.roles.every((role) => !role.name.includes("ADMIN"))).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Manage users and their roles</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog} className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add User</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Create a new user account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="add-name">Name</Label>
                        <Input
                          id="add-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter user name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="add-email">Email</Label>
                        <Input
                          id="add-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </div>
                      {/*
                      <div className="space-y-2">
                        <Label htmlFor="add-role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      */}
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>Add User</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role, index) => (
                            <Badge
                              key={role.id}
                              variant={role.name.includes("ADMIN") ? "default" : "secondary"}
                              className={index > 0 ? "ml-1" : ""}
                            >
                              {role.name.replace("ROLE_", "")}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">USER</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser.id}
                            className="flex items-center space-x-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user information and role</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter user name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                {/*
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditUser}>Update User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
