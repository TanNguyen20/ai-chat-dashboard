"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
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
import { Role as EnumRole } from "@/const/role"
import { useAuth } from "@/contexts/Authentication"
import { RoleService } from "@/services/role"
import type { CreateRole, Role } from "@/types/role"
import { hasRole } from "@/utils/commons"
import {
  AlertCircle,
  Calendar,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import type { Page } from "@/types/pagination"

export default function RolesPage() {
  const { user } = useAuth()
  const [paginatedData, setPaginatedData] = useState<Page<Role> | null>(null)
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

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

  const fetchRoles = async (page = currentPage, size = pageSize) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await RoleService.getRolesPagination({
        page,
        size,
        sort: "name",
      })
      setPaginatedData(data)
      setFilteredRoles(data.content)
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
  }, [canView, currentPage, pageSize])

  useEffect(() => {
    if (!paginatedData) return

    if (!searchQuery.trim()) {
      setFilteredRoles(paginatedData.content)
      return
    }

    const filtered = paginatedData.content.filter(
      (role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredRoles(filtered)
  }, [searchQuery, paginatedData])

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number.parseInt(size))
    setCurrentPage(0) // Reset to first page when changing page size
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

  const generatePageNumbers = () => {
    if (!paginatedData) return []

    const totalPages = paginatedData.totalPages
    const current = paginatedData.number
    const pages = []

    // Always show first page
    if (totalPages > 0) pages.push(0)

    // Show pages around current page
    const start = Math.max(1, current - 1)
    const end = Math.min(totalPages - 1, current + 1)

    if (start > 1) pages.push(-1) // Ellipsis

    for (let i = start; i <= end; i++) {
      if (i !== 0 && i !== totalPages - 1) {
        pages.push(i)
      }
    }

    if (end < totalPages - 2) pages.push(-1) // Ellipsis

    // Always show last page if more than 1 page
    if (totalPages > 1) pages.push(totalPages - 1)

    return pages
  }

  if (!canView) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-7xl mx-auto">
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
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <Skeleton className="h-8 w-48 mb-2" />
            {/* prevent overflow on mobile */}
            <Skeleton className="h-4 w-full sm:w-96" />
          </div>
          <Skeleton className="h-10 w-32 self-end sm:self-auto" />
        </div>

        {/* Search skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role items skeleton - respects view mode and page size */}
        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {Array.from({ length: pageSize }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-20 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-4 w-36" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Role Management</h1>
          <p className="text-muted-foreground">
            Manage system roles and permissions
            {!canCreateDelete && (
              <span className="block text-sm text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ View-only access - Only superadmin can create/delete roles
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap sm:flex-nowrap justify-end sm:justify-normal">
          <Button onClick={() => fetchRoles()} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {/* Create Role Dialog - Only for superadmin */}
          {canCreateDelete && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
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

                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="page-size" className="text-sm whitespace-nowrap">
            Per page:
          </Label>
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
      {!error && paginatedData && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paginatedData.totalElements}</div>
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
                <CardTitle className="text-sm font-medium">Current Page</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paginatedData.number + 1} of {paginatedData.totalPages}
                </div>
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
            <>
              <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {filteredRoles.map((role) => (
                  <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        {/* text block */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                            <Shield className="h-5 w-5 shrink-0" />
                            <span className="truncate">{role.name}</span>
                          </CardTitle>
                          <CardDescription className="mt-1 truncate">Role ID: {role.id}</CardDescription>
                        </div>
                        {/* actions */}
                        <div className="flex items-center gap-2 shrink-0">
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
                                    Are you sure you want to delete the role "{role.name}"? This action cannot be
                                    undone.
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
                            <p className="text-muted-foreground mt-1 break-words">{role.description}</p>
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

              {paginatedData.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(0, paginatedData.number - 1))}
                          className={paginatedData.first ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {generatePageNumbers().map((pageNum, index) => (
                        <PaginationItem key={index}>
                          {pageNum === -1 ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={pageNum === paginatedData.number}
                              className="cursor-pointer"
                            >
                              {pageNum + 1}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(Math.min(paginatedData.totalPages - 1, paginatedData.number + 1))
                          }
                          className={paginatedData.last ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <div className="text-sm text-muted-foreground text-center mt-2">
                    Showing {paginatedData.numberOfElements} of {paginatedData.totalElements} roles
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
