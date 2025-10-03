"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Trash2, Edit, Plus, MoreVertical, RefreshCw, Loader2 } from "lucide-react"

import { RoleService } from "@/services/role"
import type { Role as BERole } from "@/types/role"

import { PageAccessService } from "@/services/pageAccess"
import type {
  CrudKey,
  CrudSet,
  PageAccess as BEPage,
  RolePermissions,
  UpsertPageRequest,
  PageAccess,
} from "@/types/pageAccess"
import Loading from "./loading"
import { useAuth } from "@/contexts/Authentication"
import type { Page, PaginationRequestParams } from "@/types/pagination"

interface AppRoute {
  file: string
  next: string
  pattern: string
}

/* ---------- helpers ---------- */
const defaultCRUDPermissions = { create: false, read: true, update: false, delete: false }
const emptyCrud = (): CrudSet => defaultCRUDPermissions

const ensureRoles = (roleNames: string[], current?: Partial<RolePermissions>): RolePermissions => {
  const next: RolePermissions = {}
  for (const rn of roleNames) {
    next[rn] = current?.[rn] ? { ...defaultCRUDPermissions, ...current[rn]! } : emptyCrud()
  }
  return next
}

const anyPermissionTrue = (c: CrudSet) => c.create || c.read || c.update || c.delete

const prettyRoleLabel = (roleName: string) =>
  roleName
    .replace(/^ROLE_/, "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

const roleColor = (roleName: string) => {
  if (roleName === "ROLE_USER") return "bg-green-100 text-green-800"
  if (roleName === "ROLE_ADMIN") return "bg-red-100 text-red-800"
  if (roleName === "ROLE_OWNER") return "bg-purple-100 text-purple-800"
  if (roleName === "ROLE_SUPER_ADMIN") return "bg-amber-100 text-amber-800"
  return "bg-gray-100 text-gray-800"
}

/* ---------- skeleton components ---------- */
const PageCardSkeleton = () => (
  <Card className="border border-border">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40 mb-3" />
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-18" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const PermissionMatrixSkeleton = () => (
  <div className="w-full overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-2">Role</th>
          <th className="text-xs font-medium text-muted-foreground pb-2 px-2">Create</th>
          <th className="text-xs font-medium text-muted-foreground pb-2 px-2">Read</th>
          <th className="text-xs font-medium text-muted-foreground pb-2 px-2">Update</th>
          <th className="text-xs font-medium text-muted-foreground pb-2 px-2">Delete</th>
          <th className="text-xs font-medium text-muted-foreground pb-2 pl-2">All</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3].map((i) => (
          <tr key={i} className="border-t">
            <td className="py-2 pr-2">
              <Skeleton className="h-6 w-16" />
            </td>
            <td className="px-2 py-2 text-center">
              <Skeleton className="h-4 w-4 mx-auto" />
            </td>
            <td className="px-2 py-2 text-center">
              <Skeleton className="h-4 w-4 mx-auto" />
            </td>
            <td className="px-2 py-2 text-center">
              <Skeleton className="h-4 w-4 mx-auto" />
            </td>
            <td className="px-2 py-2 text-center">
              <Skeleton className="h-4 w-4 mx-auto" />
            </td>
            <td className="pl-2 py-2">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/* ---------- component ---------- */

export function RoleAccessSettings() {
  const { toast } = useToast()
  const [routes, setRoutes] = useState<AppRoute[]>([])
  const [loadingRoutes, setLoadingRoutes] = useState(false)

  const [roles, setRoles] = useState<BERole[] | null>(null)
  const roleNames = useMemo(() => (roles ? roles.map((r) => r.name) : []), [roles])

  const [paginatedData, setPaginatedData] = useState<Page<PageAccess> | null>(null)
  const [loadingPages, setLoadingPages] = useState<null | boolean>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<BEPage | null>(null)
  const { isLoading: isAuthLoading } = useAuth()

  const [isAddingPage, setIsAddingPage] = useState(false)
  const [isUpdatingPage, setIsUpdatingPage] = useState(false)
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null)

  const [newPage, setNewPage] = useState<UpsertPageRequest>({
    url: "",
    description: "",
    rolePermissions: {},
  })

  const pages = paginatedData?.content || []

  const handleRouteSelect = (url: string) => {
    setNewPage({ ...newPage, url })
  }

  const handleEditRouteSelect = (url: string) => {
    if (editingPage) {
      setEditingPage({ ...editingPage, url })
    }
  }

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true)
      try {
        const res = await fetch("/app-routes.json")
        if (res.ok) setRoutes(await res.json())
      } catch (e) {
        console.error("Failed to fetch app routes:", e)
      } finally {
        setLoadingRoutes(false)
      }
    }
    fetchRoutes()
  }, [])

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await RoleService.getAllRole()
        const sorted = [...data].sort((a, b) => (a.name > b.name ? 1 : -1))
        setRoles(sorted)
      } catch (e) {
        console.error("Failed to load roles:", e)
        setRoles([])
      }
    }
    loadRoles()
  }, [])

  const loadPages = async () => {
    if (roles === null) return
    setLoadingPages(true)
    try {
      const paginationParams: PaginationRequestParams = { page: currentPage, size: pageSize }
      const response = await PageAccessService.listWithPagination(paginationParams)

      const normalizedContent = response.content.map((p) => ({
        ...p,
        rolePermissions: ensureRoles(roleNames, p.rolePermissions),
      }))

      setPaginatedData({
        ...response,
        content: normalizedContent,
      })

      setNewPage((prev) => ({
        ...prev,
        rolePermissions: ensureRoles(roleNames, prev.rolePermissions),
      }))
    } catch (e) {
      console.error("Failed to load pages:", e)
    } finally {
      setLoadingPages(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [roles, currentPage, pageSize])

  const handleRefresh = () => {
    loadPages()
  }

  const getRouteDescription = (route: AppRoute) => {
    const segments = route.file.split("/")
    const fileName = segments[segments.length - 2] || segments[segments.length - 1]
    return fileName.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleAddPage = async () => {
    if (!newPage.url || !newPage.description) return
    setIsAddingPage(true)
    try {
      const payload: UpsertPageRequest = {
        url: newPage.url,
        description: newPage.description,
        rolePermissions: ensureRoles(roleNames, newPage.rolePermissions),
      }
      const created = await PageAccessService.create(payload)
      const normalized = { ...created, rolePermissions: ensureRoles(roleNames, created.rolePermissions) }

      if (paginatedData) {
        const updatedContent = [...paginatedData.content, normalized]
        setPaginatedData({
          ...paginatedData,
          content: updatedContent,
          totalElements: paginatedData.totalElements + 1,
        })
      }

      setNewPage({ url: "", description: "", rolePermissions: ensureRoles(roleNames) })
      setIsAddDialogOpen(false)
    } catch (e) {
      console.error("Create page failed:", e)
      toast({
        title: "Create failed",
        description: "Failed to create the page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingPage(false)
    }
  }

  const handleDeletePage = async (id: number) => {
    setDeletingPageId(id)
    try {
      await PageAccessService.delete(id)

      if (paginatedData) {
        const updatedContent = paginatedData.content.filter((p) => p.id !== id)
        setPaginatedData({
          ...paginatedData,
          content: updatedContent,
          totalElements: paginatedData.totalElements - 1,
        })
      }

      toast({
        title: "Page deleted",
        description: "The page access configuration has been successfully removed.",
      })
    } catch (e) {
      console.error("Delete page failed:", e)
      toast({
        title: "Delete failed",
        description: "Failed to delete the page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingPageId(null)
    }
  }

  const handleEditPage = (page: BEPage) => {
    setEditingPage({
      ...page,
      rolePermissions: ensureRoles(roleNames, page.rolePermissions),
    })
  }

  const handleUpdatePage = async () => {
    if (!editingPage) return
    setIsUpdatingPage(true)
    try {
      const payload: UpsertPageRequest = {
        url: editingPage.url,
        description: editingPage.description,
        rolePermissions: ensureRoles(roleNames, editingPage.rolePermissions),
      }
      const updated = await PageAccessService.update(editingPage.id, payload)
      const normalized = { ...updated, rolePermissions: ensureRoles(roleNames, updated.rolePermissions) }

      if (paginatedData) {
        const updatedContent = paginatedData.content.map((p) => (p.id === normalized.id ? normalized : p))
        setPaginatedData({
          ...paginatedData,
          content: updatedContent,
        })
      }

      setEditingPage(null)
    } catch (e) {
      console.error("Update page failed:", e)
      toast({
        title: "Update failed",
        description: "Failed to update the page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPage(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number.parseInt(size))
    setCurrentPage(0)
  }

  const toggleNewPageRolePermission = (roleName: string, perm: CrudKey) => {
    const rp = ensureRoles(roleNames, newPage.rolePermissions)
    rp[roleName][perm] = !rp[roleName][perm]
    setNewPage({ ...newPage, rolePermissions: { ...rp } })
  }

  const setAllNewPageRole = (roleName: string, value: boolean) => {
    const rp = ensureRoles(roleNames, newPage.rolePermissions)
    rp[roleName] = { create: value, read: value, update: value, delete: value }
    setNewPage({ ...newPage, rolePermissions: { ...rp } })
  }

  const toggleEditPageRolePermission = (roleName: string, perm: CrudKey) => {
    if (!editingPage) return
    const rp = ensureRoles(roleNames, editingPage.rolePermissions)
    rp[roleName][perm] = !rp[roleName][perm]
    setEditingPage({ ...editingPage, rolePermissions: { ...rp } })
  }

  const setAllEditPageRole = (roleName: string, value: boolean) => {
    if (!editingPage) return
    const rp = ensureRoles(roleNames, editingPage.rolePermissions)
    rp[roleName] = { create: value, read: value, update: value, delete: value }
    setEditingPage({ ...editingPage, rolePermissions: { ...rp } })
  }

  const PermissionMatrix = ({
    rolePermissions,
    onToggle,
    onSetAll,
    compact = false,
  }: {
    rolePermissions: RolePermissions
    onToggle: (roleName: string, perm: CrudKey) => void
    onSetAll: (roleName: string, value: boolean) => void
    compact?: boolean
  }) => {
    const perms: CrudKey[] = ["create", "read", "update", "delete"]
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-2">Role</th>
              {perms.map((p) => (
                <th key={p} className="text-xs font-medium text-muted-foreground pb-2 px-2 capitalize">
                  {p}
                </th>
              ))}
              <th className="text-xs font-medium text-muted-foreground pb-2 pl-2">All</th>
            </tr>
          </thead>
          <tbody>
            {roleNames.map((role) => (
              <tr key={role} className="border-t">
                <td className="py-2 pr-2">
                  <Badge variant="secondary" className={roleColor(role)}>
                    {prettyRoleLabel(role)}
                  </Badge>
                </td>
                {perms.map((perm) => (
                  <td key={perm} className="px-2 py-2">
                    <Checkbox
                      checked={rolePermissions[role]?.[perm] ?? false}
                      onCheckedChange={() => onToggle(role, perm)}
                      aria-label={`${prettyRoleLabel(role)} ${perm}`}
                    />
                  </td>
                ))}
                <td className="pl-2 py-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size={compact ? "sm" : "sm"} onClick={() => onSetAll(role, true)}>
                      Enable
                    </Button>
                    <Button variant="ghost" size={compact ? "sm" : "sm"} onClick={() => onSetAll(role, false)}>
                      Clear
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (isAuthLoading) {
    return <Loading />
  }

  return (
    <div>
      <Toaster />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Role-Based Page Access</h2>
          <p className="text-muted-foreground text-pretty">
            Assign <span className="font-medium">CRUD permissions per role</span>
          </p>
          {paginatedData && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {paginatedData.numberOfElements} of {paginatedData.totalElements} pages
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loadingPages === true}
            title="Refresh page data"
          >
            <RefreshCw className={`h-4 w-4 ${loadingPages === true ? "animate-spin" : ""}`} />
          </Button>

          <div className="flex items-center gap-2">
            <Label htmlFor="pageSize" className="text-sm">
              Show:
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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!roles || roleNames.length === 0}>
                <Plus className="h-4 w-4" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Page</DialogTitle>
                <DialogDescription>Pick a page and configure role-specific permissions</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="url">Page URL</Label>
                  <Select value={newPage.url} onValueChange={handleRouteSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingRoutes ? "Loading routes..." : "Select a page URL"} />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.next} value={route.next}>
                          <div className="flex flex-col">
                            <span className="font-medium">{route.next}</span>
                            <span className="text-xs text-muted-foreground">{getRouteDescription(route)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the page"
                    value={newPage.description}
                    onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Per-Role Permissions</Label>
                  {roles === null ? (
                    <PermissionMatrixSkeleton />
                  ) : roles && roleNames.length > 0 ? (
                    <PermissionMatrix
                      rolePermissions={ensureRoles(roleNames, newPage.rolePermissions)}
                      onToggle={toggleNewPageRolePermission}
                      onSetAll={setAllNewPageRole}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">No roles available</div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isAddingPage}>
                  Cancel
                </Button>
                <Button onClick={handleAddPage} disabled={!roles || roleNames.length === 0 || isAddingPage}>
                  {isAddingPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAddingPage ? "Adding..." : "Add Page"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {loadingPages === null || loadingPages === true ? (
          <div className="space-y-4">
            <PageCardSkeleton />
            <PageCardSkeleton />
            <PageCardSkeleton />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-sm text-muted-foreground">No pages configured yet.</div>
          </div>
        ) : (
          pages.map((page) => {
            const enabledRoles = roleNames.filter(
              (r) => page.rolePermissions[r] && anyPermissionTrue(page.rolePermissions[r]),
            )
            return (
              <Card key={page.id} className="border border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-medium text-card-foreground">{page.url}</CardTitle>
                      <CardDescription className="text-pretty">{page.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={deletingPageId === page.id}>
                          {deletingPageId === page.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPage(page)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(page.id)}
                          className="text-destructive"
                          disabled={deletingPageId !== null}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-card-foreground mb-3 block">Roles with Access</Label>
                    <div className="flex flex-wrap gap-2">
                      {roles && enabledRoles.length > 0 ? (
                        enabledRoles.map((r) => (
                          <Badge key={r} variant="secondary" className={roleColor(r)}>
                            {prettyRoleLabel(r)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No roles have permissions</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-card-foreground mb-1 block">
                      CRUD Permission Matrix
                    </Label>
                    <div className="w-full overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-2">Role</th>
                            {(["create", "read", "update", "delete"] as CrudKey[]).map((p) => (
                              <th key={p} className="text-xs font-medium text-muted-foreground pb-2 px-2 capitalize">
                                {p}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {roleNames.map((role) => (
                            <tr key={role} className="border-t align-baseline">
                              <td className="py-2 pr-2">
                                <Badge variant="secondary" className={roleColor(role)}>
                                  {prettyRoleLabel(role)}
                                </Badge>
                              </td>
                              {(["create", "read", "update", "delete"] as CrudKey[]).map((perm) => (
                                <td key={perm} className="px-2 py-2">
                                  <div className="flex items-center justify-center">
                                    <div
                                      className={`w-3 h-3 rounded-full ${
                                        page.rolePermissions[role]?.[perm] ? "bg-green-500" : "bg-gray-300"
                                      }`}
                                    />
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {paginatedData && paginatedData.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: paginatedData.totalPages }, (_, i) => {
                const showPage = i === 0 || i === paginatedData.totalPages - 1 || Math.abs(i - currentPage) <= 1

                if (!showPage) {
                  if (i === 1 && currentPage > 3) {
                    return (
                      <PaginationItem key={`ellipsis-start`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  if (i === paginatedData.totalPages - 2 && currentPage < paginatedData.totalPages - 4) {
                    return (
                      <PaginationItem key={`ellipsis-end`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                }

                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i)}
                      isActive={currentPage === i}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === paginatedData.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Page Access</DialogTitle>
            <DialogDescription>Update the page and per-role permissions</DialogDescription>
          </DialogHeader>
          {editingPage && roles && roleNames.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-url">Page URL</Label>
                <Select value={editingPage.url} onValueChange={handleEditRouteSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page URL" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.next} value={route.next}>
                        <div className="flex flex-col">
                          <span className="font-medium">{route.next}</span>
                          <span className="text-xs text-muted-foreground">{getRouteDescription(route)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingPage.description}
                  onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Per-Role Permissions</Label>
                <PermissionMatrix
                  rolePermissions={ensureRoles(roleNames, editingPage.rolePermissions)}
                  onToggle={toggleEditPageRolePermission}
                  onSetAll={setAllEditPageRole}
                  compact
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPage(null)} disabled={isUpdatingPage}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePage} disabled={isUpdatingPage}>
              {isUpdatingPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdatingPage ? "Updating..." : "Update Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
