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
import { Role } from "@/const/role"
import { useAuth } from "@/contexts/Authentication"
import { AnalyticsConfigService } from "@/services/analyticsConfig"
import type { AnalyticsConfig, CreateAnalyticsConfig, UpdateAnalyticsConfig } from "@/types/analyticsConfig"
import { hasRole } from "@/utils/commons"
import {
  AlertCircle,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"

export default function AnalyticsConfigPage() {
  const { user } = useAuth()
  const [configs, setConfigs] = useState<AnalyticsConfig[]>([])
  const [filteredConfigs, setFilteredConfigs] = useState<AnalyticsConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateAnalyticsConfig>({
    hostname: "",
    username: "",
    password: "",
  })
  const [showCreatePassword, setShowCreatePassword] = useState(false)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AnalyticsConfig | null>(null)
  const [editFormData, setEditFormData] = useState<UpdateAnalyticsConfig>({
    hostname: "",
    username: "",
    password: "",
  })
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Check if user has access to analytics config
  const hasAccess = hasRole(user!, Role.ADMIN)

  const fetchConfigs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await AnalyticsConfigService.getAllAnalyticsConfig()
      setConfigs(data)
      setFilteredConfigs(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics configs"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!hasAccess) {
      setError("Access denied. You need admin privileges to view analytics configuration.")
      setIsLoading(false)
      return
    }
    fetchConfigs()
  }, [hasAccess])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConfigs(configs)
      return
    }

    const filtered = configs.filter((config) => config.hostname.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredConfigs(filtered)
  }, [searchQuery, configs])

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createFormData.hostname || !createFormData.username || !createFormData.password) {
      return
    }

    setIsCreating(true)
    try {
      await AnalyticsConfigService.createAnalyticsConfig(createFormData)
      fetchConfigs()
      setCreateDialogOpen(false)
      // Reset form
      setCreateFormData({
        hostname: "",
        username: "",
        password: "",
      })
      setShowCreatePassword(false)
    } catch (error) {
      console.error("Failed to create analytics config:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditConfig = (config: AnalyticsConfig) => {
    setEditingConfig(config)
    setEditFormData({
      hostname: config.hostname,
      username: "",
      password: "",
    })
    setEditDialogOpen(true)
    setShowEditPassword(false)
  }

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingConfig || !editFormData.hostname || !editFormData.username || !editFormData.password) {
      return
    }

    setIsEditing(true)
    try {
      await AnalyticsConfigService.updateAnalyticsConfig(editingConfig.id, editFormData)
      fetchConfigs()
      setEditDialogOpen(false)
      setEditingConfig(null)
      // Reset form
      setEditFormData({
        hostname: "",
        username: "",
        password: "",
      })
      setShowEditPassword(false)
    } catch (error) {
      console.error("Failed to update analytics config:", error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteConfig = async (id: number) => {
    setDeletingId(id)
    try {
      await AnalyticsConfigService.deleteAnalyticsConfig(id)
      fetchConfigs()
    } catch (error) {
      console.error("Failed to delete config:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col gap-4 p-4 overflow-x-hidden">
        <div className="flex flex-1 items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. You need admin privileges to view analytics configuration.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-3 sm:p-4 overflow-x-hidden">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="w-full sm:w-auto">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-full sm:w-96" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Skeleton className="h-10 w-full sm:flex-1 sm:max-w-sm" />
          <Skeleton className="h-10 w-full sm:w-24" />
          <Skeleton className="h-10 w-full sm:w-24" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight break-words">Analytics Configuration</h1>
          <p className="text-muted-foreground">Manage analytics server configurations and credentials</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={fetchConfigs} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {/* Create Config Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Analytics Configuration</DialogTitle>
                <DialogDescription>Add a new analytics server configuration.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateConfig} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-hostname">Hostname</Label>
                  <Input
                    id="create-hostname"
                    value={createFormData.hostname}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, hostname: e.target.value }))}
                    placeholder="https://your-analytics-server.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-username">Username</Label>
                  <Input
                    id="create-username"
                    value={createFormData.username}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showCreatePassword ? "text" : "password"}
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Configuration
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative w-full sm:flex-1 sm:max-w-sm min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search configurations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setViewMode("list")}
          >
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
                <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{configs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredConfigs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Servers</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{configs.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Config Grid/List */}
          {filteredConfigs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No configurations found" : "No analytics configurations"}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first analytics configuration"}
                </p>
                {!searchQuery && (
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Configuration
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredConfigs.map((config) => (
                <Card key={config.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2 break-words">
                          <Server className="h-5 w-5" />
                          Configuration #{config.id}
                        </CardTitle>
                        <CardDescription className="mt-1">Analytics Server</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditConfig(config)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {deletingId === config.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Analytics Configuration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this configuration? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteConfig(config.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={deletingId === config.id}
                              >
                                {deletingId === config.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Hostname:</strong>
                        <p className="text-muted-foreground break-all">{config.hostname}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ID: {config.id}
                      </Badge>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Analytics Configuration</DialogTitle>
            <DialogDescription>Update the analytics server configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateConfig} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-hostname">Hostname</Label>
              <Input
                id="edit-hostname"
                value={editFormData.hostname}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, hostname: e.target.value }))}
                placeholder="https://your-analytics-server.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editFormData.password}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
