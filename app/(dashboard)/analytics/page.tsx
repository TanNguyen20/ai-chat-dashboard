"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
  BarChart3,
  Search,
  RefreshCw,
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Plus,
  X,
  Loader2,
  Trash2,
  ExternalLink,
  Users,
  Shield,
  Edit,
} from "lucide-react"
import { AnalyticsService } from "@/services/analytics"
import type { AnalyticsDashboard, CreateAnalyticsDashboard } from "@/types/analytics"
import { useAuth } from "@/components/auth-provider"
import { hasRole } from "@/utils/commons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyticsConfigService } from "@/services/analyticsConfig"
import type { AnalyticsConfig } from "@/types/analyticsConfig"
import { Role } from "@/const/role"

export default function AnalyticsListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([])
  const [filteredDashboards, setFilteredDashboards] = useState<AnalyticsDashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [analyticsConfigs, setAnalyticsConfigs] = useState<AnalyticsConfig[]>([])

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<CreateAnalyticsDashboard>({
    dashboardId: "",
    analyticsConfigId: 0,
    dashboardHost: "",
    dashboardTitle: "",
    roles: [],
    users: [],
  })
  const [newRole, setNewRole] = useState("")
  const [newUser, setNewUser] = useState("")

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<AnalyticsDashboard | null>(null)
  const [editFormData, setEditFormData] = useState<CreateAnalyticsDashboard>({
    dashboardId: "",
    analyticsConfigId: 0,
    dashboardHost: "",
    dashboardTitle: "",
    roles: [],
    users: [],
  })
  const [editNewRole, setEditNewRole] = useState("")
  const [editNewUser, setEditNewUser] = useState("")

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Check if user has access to analytics
  const hasAccess = hasRole(user!, Role.USER)

  const fetchDashboards = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await AnalyticsService.getAllAnalyticsDashboard()
      setDashboards(data)
      setFilteredDashboards(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics dashboards"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalyticsConfigs = async () => {
    try {
      const data = await AnalyticsConfigService.getAllAnalyticsConfig()
      setAnalyticsConfigs(data)
    } catch (error) {
      console.error("Failed to fetch analytics configs:", error)
    }
  }

  useEffect(() => {
    if (!hasAccess) {
      setError("Access denied. You need appropriate privileges to view analytics.")
      setIsLoading(false)
      return
    }
    fetchDashboards()
    fetchAnalyticsConfigs()
  }, [hasAccess])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDashboards(dashboards)
      return
    }

    const filtered = dashboards.filter(
      (dashboard) =>
        dashboard.dashboardTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.dashboardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.dashboardHost.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.roles.some((role) => role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        dashboard.users.some((user) => user.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredDashboards(filtered)
  }, [searchQuery, dashboards])

  const handleCreateAnalytics = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.dashboardId || !formData.dashboardHost || !formData.dashboardTitle || !formData.analyticsConfigId) {
      return
    }

    setIsCreating(true)
    try {
      await AnalyticsService.createAnalyticsDashboard(formData)
      fetchDashboards()
      setCreateDialogOpen(false)
      // Reset form
      setFormData({
        dashboardId: "",
        analyticsConfigId: 0,
        dashboardHost: "",
        dashboardTitle: "",
        roles: [],
        users: [],
      })
      setNewRole("")
      setNewUser("")
    } catch (error) {
      console.error("Failed to create analytics dashboard:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditDashboard = (dashboard: AnalyticsDashboard) => {
    setEditingDashboard(dashboard)
    setEditFormData({
      dashboardId: dashboard.dashboardId,
      analyticsConfigId: dashboard.analyticsConfigId,
      dashboardHost: dashboard.dashboardHost,
      dashboardTitle: dashboard.dashboardTitle,
      roles: [...dashboard.roles],
      users: [...dashboard.users],
    })
    setEditDialogOpen(true)
    setEditNewRole("")
    setEditNewUser("")
  }

  const handleUpdateDashboard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !editingDashboard ||
      !editFormData.dashboardId ||
      !editFormData.dashboardHost ||
      !editFormData.dashboardTitle ||
      !editFormData.analyticsConfigId
    ) {
      return
    }

    setIsEditing(true)
    try {
      await AnalyticsService.updateAnalyticsDashboard(editingDashboard.id, editFormData)
      fetchDashboards()
      setEditDialogOpen(false)
      setEditingDashboard(null)
      // Reset form
      setEditFormData({
        dashboardId: "",
        analyticsConfigId: 0,
        dashboardHost: "",
        dashboardTitle: "",
        roles: [],
        users: [],
      })
      setEditNewRole("")
      setEditNewUser("")
    } catch (error) {
      console.error("Failed to update analytics dashboard:", error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteAnalytics = async (id: number) => {
    setDeletingId(id)
    try {
      await AnalyticsService.deleteAnalyticsDashboard(id)
      fetchDashboards()
    } catch (error) {
      console.error("Failed to delete dashboard:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleNavigateToDetail = (id: number) => {
    router.push(`/analytics/${id}`)
  }

  const addRole = () => {
    if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, newRole.trim()],
      }))
      setNewRole("")
    }
  }

  const removeRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r !== role),
    }))
  }

  const addUser = () => {
    if (newUser.trim() && !formData.users.includes(newUser.trim())) {
      setFormData((prev) => ({
        ...prev,
        users: [...prev.users, newUser.trim()],
      }))
      setNewUser("")
    }
  }

  const removeUser = (user: string) => {
    setFormData((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u !== user),
    }))
  }

  const addEditRole = () => {
    if (editNewRole.trim() && !editFormData.roles.includes(editNewRole.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, editNewRole.trim()],
      }))
      setEditNewRole("")
    }
  }

  const removeEditRole = (role: string) => {
    setEditFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r !== role),
    }))
  }

  const addEditUser = () => {
    if (editNewUser.trim() && !editFormData.users.includes(editNewUser.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        users: [...prev.users, editNewUser.trim()],
      }))
      setEditNewUser("")
    }
  }

  const removeEditUser = (user: string) => {
    setEditFormData((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u !== user),
    }))
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-1 items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Access denied. You need appropriate privileges to view analytics.</AlertDescription>
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboards</h1>
          <p className="text-muted-foreground">Manage and monitor your analytics dashboards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchDashboards} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {/* Create Analytics Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Analytics Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Analytics Dashboard</DialogTitle>
                <DialogDescription>Add a new analytics dashboard to your collection.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAnalytics} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dashboardTitle">Dashboard Title</Label>
                    <Input
                      id="dashboardTitle"
                      value={formData.dashboardTitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dashboardTitle: e.target.value }))}
                      placeholder="Enter dashboard title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dashboardId">Dashboard ID</Label>
                    <Input
                      id="dashboardId"
                      value={formData.dashboardId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dashboardId: e.target.value }))}
                      placeholder="e.g., 74c5a97f-71fc-4330-96a0-7af644a70f83"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dashboardHost">Dashboard Host</Label>
                    <Select
                      value={formData.dashboardHost}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          dashboardHost: value,
                          analyticsConfigId: analyticsConfigs.find((config) => config.hostname === value)?.id || 0,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dashboard host" />
                      </SelectTrigger>
                      <SelectContent>
                        {analyticsConfigs.map((config) => (
                          <SelectItem key={config.id} value={config.hostname}>
                            {config.hostname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Add role (e.g., ROLE_ADMIN)"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRole())}
                      />
                      <Button type="button" onClick={addRole} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="flex items-center gap-1">
                          {role}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeRole(role)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Users</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newUser}
                        onChange={(e) => setNewUser(e.target.value)}
                        placeholder="Add user"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addUser())}
                      />
                      <Button type="button" onClick={addUser} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.users.map((user) => (
                        <Badge key={user} variant="outline" className="flex items-center gap-1">
                          {user}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeUser(user)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Dashboard
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search dashboards..."
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
                <CardTitle className="text-sm font-medium">Total Dashboards</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboards.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredDashboards.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Hosts</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(dashboards.map((d) => d.dashboardHost)).size}</div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Grid/List */}
          {filteredDashboards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No dashboards found" : "No analytics dashboards"}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first analytics dashboard"}
                </p>
                {!searchQuery && (
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Analytics Dashboard
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredDashboards.map((dashboard) => (
                <Card key={dashboard.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => handleNavigateToDetail(dashboard.id)}>
                        <CardTitle className="text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                          <BarChart3 className="h-5 w-5" />
                          {dashboard.dashboardTitle}
                        </CardTitle>
                        <CardDescription className="mt-1">ID: {dashboard.dashboardId}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                          <a
                            href={dashboard.dashboardHost}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditDashboard(dashboard)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {deletingId === dashboard.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Analytics Dashboard</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{dashboard.dashboardTitle}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAnalytics(dashboard.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={deletingId === dashboard.id}
                              >
                                {deletingId === dashboard.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => handleNavigateToDetail(dashboard.id)}>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <strong>Host:</strong> {dashboard.dashboardHost}
                      </div>

                      {dashboard.roles.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Shield className="h-4 w-4" />
                            Roles
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dashboard.roles.map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {dashboard.users.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4" />
                            Users
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dashboard.users.map((user) => (
                              <Badge key={user} variant="outline" className="text-xs">
                                {user}
                              </Badge>
                            ))}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Analytics Dashboard</DialogTitle>
            <DialogDescription>Update the analytics dashboard configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDashboard} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dashboardTitle">Dashboard Title</Label>
                <Input
                  id="edit-dashboardTitle"
                  value={editFormData.dashboardTitle}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, dashboardTitle: e.target.value }))}
                  placeholder="Enter dashboard title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dashboardId">Dashboard ID</Label>
                <Input
                  id="edit-dashboardId"
                  value={editFormData.dashboardId}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, dashboardId: e.target.value }))}
                  placeholder="e.g., 74c5a97f-71fc-4330-96a0-7af644a70f83"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dashboardHost">Dashboard Host</Label>
                <Select
                  value={editFormData.dashboardHost}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      dashboardHost: value,
                      analyticsConfigId: analyticsConfigs.find((config) => config.hostname === value)?.id || 0,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dashboard host" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyticsConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.hostname}>
                        {config.hostname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="flex gap-2">
                  <Input
                    value={editNewRole}
                    onChange={(e) => setEditNewRole(e.target.value)}
                    placeholder="Add role (e.g., ROLE_ADMIN)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEditRole())}
                  />
                  <Button type="button" onClick={addEditRole} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editFormData.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="flex items-center gap-1">
                      {role}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeEditRole(role)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Users</Label>
                <div className="flex gap-2">
                  <Input
                    value={editNewUser}
                    onChange={(e) => setEditNewUser(e.target.value)}
                    placeholder="Add user"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEditUser())}
                  />
                  <Button type="button" onClick={addEditUser} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editFormData.users.map((user) => (
                    <Badge key={user} variant="outline" className="flex items-center gap-1">
                      {user}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeEditUser(user)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Dashboard
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
