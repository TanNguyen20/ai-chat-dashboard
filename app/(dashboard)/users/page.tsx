"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Role as EnumRole } from "@/const/role"
import { useAuth } from "@/contexts/Authentication"
import { toast } from "@/hooks/use-toast"
import { RoleService } from "@/services/role"
import { UserService } from "@/services/user"
import type { Role } from "@/types/role"
import type { User, UserInfoRequest } from "@/types/user"
import { formatRoleName, hasRole } from "@/utils/commons"
import { Edit, Plus, Trash2, UserCheck, UserCog, Users, UserX, RotateCcw, RefreshCw, KeyRound } from "lucide-react"
import { useEffect, useState } from "react"

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

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false)
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isResetInfoDialogOpen, setIsResetInfoDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    email: "",
    password: "",
    roles: [EnumRole.USER],
  })
  const [editUser, setEditUser] = useState<EditUser>({
    id: 0,
    username: "",
    email: "",
    roles: [],
  })
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [userInfoReset, setUserInfoReset] = useState<UserInfoRequest>({
    isAccountNonExpired: true,
    isAccountNonLocked: true,
    isCredentialsNonExpired: true,
    isEnabled: true,
  })

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [currentPage, pageSize])

  const fetchUsers = async () => {
    try {
      if (!loading) {
        setRefreshing(true)
      }
      const response = await UserService.getAllUser({ page: currentPage, size: pageSize })
      setUsers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
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
    setIsCreatingUser(true)
    try {
      await UserService.createUser(newUser)
      setNewUser({ username: "", email: "", password: "", roles: [EnumRole.USER] })
      setIsAddDialogOpen(false)
      setCurrentPage(0)
      fetchUsers()
      toast({ title: "Success", description: "User created successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" })
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleEditUser = async () => {
    setIsUpdatingUser(true)
    try {
      await UserService.updateUser(editUser.id, {
        username: editUser.username,
        email: editUser.email,
        roles: editUser.roles,
      })
      setIsEditDialogOpen(false)
      fetchUsers()
      toast({ title: "Success", description: "User updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (user?.id === userId) {
      toast({ title: "Error", description: "You cannot delete your own account", variant: "destructive" })
      return
    }
    setIsDeletingUser(true)
    try {
      await UserService.deleteUser(userId)
      if (users.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1)
      } else {
        fetchUsers()
      }
      toast({ title: "Success", description: "User deleted successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
    } finally {
      setIsDeletingUser(false)
    }
  }

  const handleUpdateUserRoles = async () => {
    if (!selectedUser) return
    setIsUpdatingRoles(true)
    try {
      await UserService.updateUserRoles(selectedUser.id, selectedRoles)
      setIsRoleDialogOpen(false)
      setSelectedUser(null)
      setSelectedRoles([])
      fetchUsers()
      toast({ title: "Success", description: "User roles updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user roles", variant: "destructive" })
    } finally {
      setIsUpdatingRoles(false)
    }
  }

  const handleResetUserInfo = async () => {
    if (!selectedUser) return
    setIsUpdatingInfo(true)
    try {
      await UserService.updateUserInfo(selectedUser.id, userInfoReset)
      setIsResetInfoDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
      toast({ title: "Success", description: "User info updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user info", variant: "destructive" })
    } finally {
      setIsUpdatingInfo(false)
    }
  }

  const openChangePasswordDialog = (u: User) => {
    setSelectedUser(u)
    setNewPassword("")
    setIsChangePasswordDialogOpen(true)
  }

  const handleChangePassword = async () => {
    if (!selectedUser) return
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    setIsChangingPassword(true)
    try {
      await UserService.updateUserPassword(selectedUser.id, newPassword)
      setIsChangePasswordDialogOpen(false)
      setSelectedUser(null)
      setNewPassword("")
      toast({ title: "Success", description: "Password changed successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const confirmDeleteUser = (userDeleting: User) => {
    if (user?.id === userDeleting?.id) {
      toast({ title: "Error", description: "You cannot delete your own account", variant: "destructive" })
      return
    }
    setUserToDelete(userDeleting)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (u: User) => {
    setEditUser({
      id: u.id,
      username: u.username,
      email: u.username, // Assuming email is same as username for now
      roles: Array.from(u.roles).map((role) => role.name),
    })
    setIsEditDialogOpen(true)
  }

  const openRoleDialog = (u: User) => {
    setSelectedUser(u)
    setSelectedRoles(Array.from(u.roles).map((role) => role.name))
    setIsRoleDialogOpen(true)
  }

  const openResetInfoDialog = (u: User) => {
    setSelectedUser(u)
    setUserInfoReset({
      isAccountNonExpired: u.accountNonExpired,
      isAccountNonLocked: u.accountNonLocked,
      isCredentialsNonExpired: u.credentialsNonExpired,
      isEnabled: u.enabled,
    })
    setIsResetInfoDialogOpen(true)
  }

  const handleRoleChange = (roleName: string, checked: boolean) => {
    if (checked) setSelectedRoles((prev) => [...prev, roleName])
    else setSelectedRoles((prev) => prev.filter((r) => r !== roleName))
  }

  const getUserRoleBadges = (userRoles: Array<Role>) =>
    userRoles.map((role) => (
      <Badge key={role.id} variant={role.name.includes("ADMIN") ? "default" : "secondary"} className="text-xs">
        {formatRoleName(role.name)}
      </Badge>
    ))

  const getStats = () => {
    const totalUsers = totalElements
    const adminUsers = users.filter((u) => Array.from(u.roles).some((r) => r.name.includes("ADMIN"))).length
    const regularUsers = users.length - adminUsers // Current page regular users
    return { totalUsers, adminUsers, regularUsers }
  }

  const getUserStatus = (userData: User) => {
    const isEnabled = userData.enabled
    const isAccountValid = userData.accountNonLocked && userData.accountNonExpired && userData.credentialsNonExpired

    if (!isEnabled) return { label: "Disabled", variant: "destructive" as const }
    if (!isAccountValid) return { label: "Locked", variant: "destructive" as const }
    return { label: "Active", variant: "default" as const }
  }

  const UserItemSkeleton = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (isMobile) {
      return (
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-24 mb-2" />
                <div className="flex flex-wrap gap-1 mb-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-5 w-14" />
              </div>
              <div className="flex shrink-0 gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <TableRow>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-14" />
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </TableCell>
      </TableRow>
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number.parseInt(newPageSize))
    setCurrentPage(0) // Reset to first page when changing page size
  }

  const { totalUsers, adminUsers, regularUsers } = getStats()
  const isSuperAdmin = user && hasRole(user, EnumRole.SUPER_ADMIN)

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 overflow-x-hidden">
        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Management Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mobile skeleton cards */}
            <div className="grid gap-3 sm:hidden">
              {[...Array(3)].map((_, i) => (
                <UserItemSkeleton key={i} isMobile />
              ))}
            </div>

            {/* Desktop table skeleton */}
            <div className="hidden sm:block">
              <div className="w-full overflow-x-auto">
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
                    {[...Array(5)].map((_, i) => (
                      <UserItemSkeleton key={i} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 overflow-x-hidden">
      {/* Stats */}
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
            <CardTitle className="text-sm font-medium">Regular Users (Current Page)</CardTitle>
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
          {/* Flex-wrap header like your working code */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="break-words">User Management</CardTitle>
              <CardDescription>
                Manage users and their permissions • Showing {users.length} of {totalElements} users
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={refreshing}
                className="w-full sm:w-auto bg-transparent"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account with specified roles.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="john.doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="space-y-2">
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
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} disabled={isCreatingUser}>
                      {isCreatingUser ? "Creating User..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:hidden">
            {refreshing
              ? [...Array(users.length || 3)].map((_, i) => <UserItemSkeleton key={`skeleton-${i}`} isMobile />)
              : users.map((u) => {
                  const status = getUserStatus(u)
                  return (
                    <Card key={u.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold break-words">{u.username}</div>
                            <div className="mt-2 flex flex-wrap gap-1">{getUserRoleBadges(u.roles)}</div>
                            <div className="mt-2">
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2 flex-wrap">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(u)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isSuperAdmin && (
                              <Button variant="outline" size="icon" onClick={() => openRoleDialog(u)}>
                                <UserCog className="h-4 w-4" />
                              </Button>
                            )}
                            {isSuperAdmin && (
                              <Button variant="outline" size="icon" onClick={() => openResetInfoDialog(u)}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {isSuperAdmin && (
                              <Button variant="outline" size="icon" onClick={() => openChangePasswordDialog(u)}>
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => confirmDeleteUser(u)}
                              disabled={u.id === user?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
          </div>

          <div className="hidden sm:block">
            <div className="w-full overflow-x-auto">
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
                  {refreshing
                    ? [...Array(users.length || 5)].map((_, i) => <UserItemSkeleton key={`skeleton-${i}`} />)
                    : users.map((userData) => {
                        const status = getUserStatus(userData)
                        return (
                          <TableRow key={userData.id}>
                            <TableCell className="font-medium break-words">{userData.username}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">{getUserRoleBadges(userData.roles)}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(userData)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {isSuperAdmin && (
                                  <Button variant="outline" size="sm" onClick={() => openRoleDialog(userData)}>
                                    <UserCog className="h-4 w-4" />
                                  </Button>
                                )}
                                {isSuperAdmin && (
                                  <Button variant="outline" size="sm" onClick={() => openResetInfoDialog(userData)}>
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                                {isSuperAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openChangePasswordDialog(userData)}
                                  >
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => confirmDeleteUser(userData)}
                                  disabled={userData.id === user?.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages} • {totalElements} total users
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {/* Show first page */}
                  {currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(0)} className="cursor-pointer">
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Show pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageIndex = Math.max(0, Math.min(currentPage - 2, totalPages - 5)) + i
                    if (pageIndex >= totalPages) return null

                    return (
                      <PaginationItem key={pageIndex}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageIndex)}
                          isActive={pageIndex === currentPage}
                          className="cursor-pointer"
                        >
                          {pageIndex + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {/* Show last page */}
                  {currentPage < totalPages - 3 && (
                    <>
                      {currentPage < totalPages - 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(totalPages - 1)} className="cursor-pointer">
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete user dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{userToDelete?.username}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingUser}
              onClick={() => {
                if (userToDelete) {
                  handleDeleteUser(userToDelete.id)
                  setIsDeleteDialogOpen(false)
                  setUserToDelete(null)
                }
              }}
            >
              {isDeletingUser ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isUpdatingUser}>
              {isUpdatingUser ? "Updating User..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUserRoles} disabled={isUpdatingRoles}>
              {isUpdatingRoles ? "Updating Roles..." : "Update Roles"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset User Info Dialog */}
      <Dialog open={isResetInfoDialogOpen} onOpenChange={setIsResetInfoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reset User Info</DialogTitle>
            <DialogDescription>Update account status settings for {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEnabled"
                checked={userInfoReset.isEnabled}
                onCheckedChange={(checked) => setUserInfoReset({ ...userInfoReset, isEnabled: checked as boolean })}
              />
              <Label htmlFor="isEnabled" className="text-sm font-medium">
                Account Enabled
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAccountNonLocked"
                checked={userInfoReset.isAccountNonLocked}
                onCheckedChange={(checked) =>
                  setUserInfoReset({ ...userInfoReset, isAccountNonLocked: checked as boolean })
                }
              />
              <Label htmlFor="isAccountNonLocked" className="text-sm font-medium">
                Account Not Locked
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAccountNonExpired"
                checked={userInfoReset.isAccountNonExpired}
                onCheckedChange={(checked) =>
                  setUserInfoReset({ ...userInfoReset, isAccountNonExpired: checked as boolean })
                }
              />
              <Label htmlFor="isAccountNonExpired" className="text-sm font-medium">
                Account Not Expired
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCredentialsNonExpired"
                checked={userInfoReset.isCredentialsNonExpired}
                onCheckedChange={(checked) =>
                  setUserInfoReset({ ...userInfoReset, isCredentialsNonExpired: checked as boolean })
                }
              />
              <Label htmlFor="isCredentialsNonExpired" className="text-sm font-medium">
                Credentials Not Expired
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetInfoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetUserInfo} disabled={isUpdatingInfo}>
              {isUpdatingInfo ? "Updating Info..." : "Update Info"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-semibold">{selectedUser?.username}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
