"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Shield,
  Search,
  RefreshCw,
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Plus,
  Loader2,
  Users,
  Calendar,
  Trash2,
} from "lucide-react"
import { RoleService } from "@/services/role"
import type { Role, CreateRole } from "@/types/role"
import { Role as EnumRole } from "@/const/role"
import { useAuth } from "@/components/auth-provider"
import { hasRole } from "@/utils/commons"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RolesPage() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateRole>({
    name: "",
    description: "",
  })

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Check permissions - admin can view, superadmin can create/delete
  const canView = hasRole(user!, EnumRole.ADMIN) || hasRole(user!, EnumRole.SUPER_ADMIN)
  const canCreateDelete = hasRole(user!, EnumRole.SUPER_ADMIN)

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await RoleService.getAllRole()
      setRoles(data)
      setFilteredRoles(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch roles"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!canView) {
      setError("Access denied. You need admin or superadmin privileges to view roles.")
      setIsLoading(false)
      return
    }
    fetchRoles()
  }, [canView])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRoles(roles)
      return
    }

    const filtered = roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredRoles(filtered)
  }, [searchQuery, roles])

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createFormData.name.trim()) {
      return
    }

    setIsCreating(true)
    try {
      await RoleService.createRole({
        name: createFormData.name.trim(),
        description: createFormData.description?.trim() || undefined,
      })
      fetchRoles()
      setCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        name: "",
        description: "",
      })
    } catch (error) {
      console.error("Failed to create role:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteRole = async (id: number) => {
    setDeletingId(id)
    try {
      await RoleService.deleteRole(id)
      fetchRoles()
    } catch (error) {
      console.error("Failed to delete role:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!canView) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-1 items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Access denied. You need admin or superadmin privileges to view roles.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage system roles and permissions
            {!canCreateDelete && (
              <span className="block text-sm text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ View-only access - Only superadmin can create/delete roles
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchRoles} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {/* Create Role Dialog - Only for superadmin */}
          {canCreateDelete && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>Add a new role to the system with optional description.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateRole} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-name">Role Name *</Label>
                    <Input
                      id="create-name"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., ROLE_MANAGER, ROLE_VIEWER"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Role names should follow the convention: ROLE_NAME (e.g., ROLE_ADMIN, ROLE_USER)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-description">Description</Label>
                    <Textarea
                      id="create-description"
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the role's purpose and permissions..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Optional description to explain the role's purpose</p>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Role
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!error && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredRoles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Roles</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.filter((role) => role.name.startsWith("ROLE_")).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Role Grid/List */}
          {filteredRoles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No roles found" : "No roles available"}</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchQuery ? "Try adjusting your search criteria" : "Get started by creating your first role"}
                </p>
                {!searchQuery && canCreateDelete && (
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Role
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredRoles.map((role) => (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {role.name}
                        </CardTitle>
                        <CardDescription className="mt-1">Role ID: {role.id}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={role.name.startsWith("ROLE_") ? "default" : "secondary"} className="text-xs">
                          {role.name.startsWith("ROLE_") ? "System" : "Custom"}
                        </Badge>
                        {canCreateDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {deletingId === role.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deletingId === role.id}
                                >
                                  {deletingId === role.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {role.description && (
                        <div className="text-sm">
                          <strong>Description:</strong>
                          <p className="text-muted-foreground mt-1">{role.description}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {role.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(role.createdAt)}
                          </div>
                        )}
                      </div>

                      {role.updatedAt && role.updatedAt !== role.createdAt && (
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated: {formatDate(role.updatedAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
