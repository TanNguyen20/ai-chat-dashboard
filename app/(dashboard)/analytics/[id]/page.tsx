"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Activity,
  Calendar,
  Settings,
  Save,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { SupersetService } from "@/services/superset"
import { AnalyticsService } from "@/services/analytics"
import { hasRole } from "@/utils/commons"
import type { AnalyticsDashboard } from "@/types/analytics"
import { useToast } from "@/hooks/use-toast"
import { Role } from "@/const/role"

// Mock analytics data
const analyticsData = {
  overview: {
    totalUsers: 1247,
    activeUsers: 892,
    totalChats: 5634,
    avgResponseTime: "1.2s",
  },
  trends: [
    { month: "Jan", users: 400, chats: 240 },
    { month: "Feb", users: 300, chats: 139 },
    { month: "Mar", users: 200, chats: 980 },
    { month: "Apr", users: 278, chats: 390 },
    { month: "May", users: 189, chats: 480 },
    { month: "Jun", users: 239, chats: 380 },
  ],
}

// Superset configuration interface
interface SupersetConfig {
  supersetDomain: string
  dashboardId: string
  analyticsConfigId: number
  hideTitle: boolean
  hideTab: boolean
  hideChartControls: boolean
  filtersVisible: boolean
  filtersExpanded: boolean
  urlParams: Record<string, string>
  iframeSandboxExtras: string[]
  referrerPolicy: string
}

export default function AnalyticsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardLoaded, setDashboardLoaded] = useState(false)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")

  const dashboardId = params.id as string

  // Superset configuration state
  const [config, setConfig] = useState<SupersetConfig>({
    supersetDomain: "http://localhost:8088",
    dashboardId: "",
    analyticsConfigId: 0,
    hideTitle: true,
    hideTab: true,
    hideChartControls: false,
    filtersVisible: true,
    filtersExpanded: true,
    urlParams: {
      foo: "value1",
      bar: "value2",
    },
    iframeSandboxExtras: ["allow-top-navigation", "allow-popups-to-escape-sandbox"],
    referrerPolicy: "same-origin",
  })

  // Check if user has access to analytics
  const hasAccess = hasRole(user!, Role.USER)

  useEffect(() => {
    if (!hasAccess) {
      setError("Access denied. You need admin privileges to view analytics.")
      setIsLoading(false)
      return
    }

    fetchDashboard()
  }, [hasAccess, dashboardId])

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await AnalyticsService.getAnalyticsDashboard(Number(dashboardId))
      setDashboard(data)

      // Update config with dashboard data
      setConfig((prev) => ({
        ...prev,
        supersetDomain: data.dashboardHost,
        dashboardId: data.dashboardId,
        analyticsConfigId: data.analyticsConfigId,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics dashboard"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch guest token directly from Superset backend
  const fetchGuestTokenFromBackend = async (): Promise<string> => {
    try {
      setConnectionStatus("connecting")
      const response = await SupersetService.getGuestToken(config.dashboardId, config.analyticsConfigId)
      setConnectionStatus("connected")
      console.log("Successfully fetched guest token from Superset backend")
      return Promise.resolve(response.token)
    } catch (error) {
      setConnectionStatus("error")
      console.error("Error fetching guest token from backend:", error)
      throw error
    }
  }

  const initializeSuperset = async () => {
    try {
      setError(null)
      setDashboardLoaded(false)
      setConnectionStatus("connecting")
      // Dynamic import of the Superset SDK
      const { embedDashboard } = await import("@superset-ui/embedded-sdk")
      console.log("Initializing Superset dashboard with config:", {
        id: config.dashboardId,
        supersetDomain: config.supersetDomain,
        dashboardUiConfig: {
          hideTitle: config.hideTitle,
          hideTab: config.hideTab,
          hideChartControls: config.hideChartControls,
          filters: {
            visible: config.filtersVisible,
            expanded: config.filtersExpanded,
          },
          urlParams: config.urlParams,
        },
      })

      // Embed the dashboard using the exact configuration from your example
      await embedDashboard({
        id: config.dashboardId, // given by the Superset embedding UI
        supersetDomain: config.supersetDomain,
        mountPoint: document.getElementById("superset-container")!, // any html element that can contain an iframe
        fetchGuestToken: () => fetchGuestTokenFromBackend(),
        dashboardUiConfig: {
          // dashboard UI config: hideTitle, hideTab, hideChartControls, filters.visible, filters.expanded (optional), urlParams (optional)
          hideTitle: config.hideTitle,
          hideTab: config.hideTab,
          hideChartControls: config.hideChartControls,
          filters: {
            visible: config.filtersVisible,
            expanded: config.filtersExpanded,
          },
          urlParams: config.urlParams,
        },
        // optional additional iframe sandbox attributes
        iframeSandboxExtras: config.iframeSandboxExtras,
        // optional config to enforce a particular referrerPolicy
        referrerPolicy: config.referrerPolicy as any,
      })

      const iframe = document.querySelector("iframe")
      if (iframe) {
        iframe.style.width = "100%"
        iframe.style.height = "-webkit-fill-available"
      }
      setDashboardLoaded(true)
      setConnectionStatus("connected")
      console.log("Superset dashboard embedded successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Failed to load Superset dashboard: ${errorMessage}`)
      setConnectionStatus("error")
      console.error("Superset initialization error:", err)
    }
  }

  const handleConfigSave = () => {
    setIsConfiguring(false)
    if (!isLoading) {
      initializeSuperset()
    }
  }

  const refreshDashboard = () => {
    if (!isLoading) {
      initializeSuperset()
    }
  }

  const updateUrlParam = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      urlParams: {
        ...prev.urlParams,
        [key]: value,
      },
    }))
  }

  const removeUrlParam = (key: string) => {
    setConfig((prev) => {
      const newUrlParams = { ...prev.urlParams }
      delete newUrlParams[key]
      return {
        ...prev,
        urlParams: newUrlParams,
      }
    })
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-1 items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Access denied. You need admin privileges to view analytics.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2 sm:h-8 sm:w-48" />
            <Skeleton className="h-4 w-full max-w-sm sm:max-w-md" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] sm:h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={() => router.back()} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Error loading dashboard</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={() => router.back()} size="sm" className="w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl truncate">{dashboard?.dashboardTitle}</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Monitor your system performance and user engagement metrics
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  ID: {dashboard?.dashboardId}
                </Badge>
                <Badge variant="secondary" className="text-xs truncate max-w-[200px]">
                  Host: {dashboard?.dashboardHost}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="mr-1 h-3 w-3" />
              Live Data
            </Badge>
            {connectionStatus === "connected" && (
              <Badge variant="default" className="text-xs bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            )}
            {connectionStatus === "connecting" && (
              <Badge variant="secondary" className="text-xs">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                Connecting
              </Badge>
            )}
            {connectionStatus === "error" && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="mr-1 h-3 w-3" />
                Error
              </Badge>
            )}
            <Button onClick={() => setIsConfiguring(!isConfiguring)} variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Configure</span>
            </Button>
            <Button onClick={refreshDashboard} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Info */}
        {dashboard && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Dashboard Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Dashboard ID</Label>
                  <p className="text-sm text-muted-foreground break-all">{dashboard.dashboardId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Host</Label>
                  <p className="text-sm text-muted-foreground break-all">{dashboard.dashboardHost}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Roles</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dashboard.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Users</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dashboard.users.map((user) => (
                      <Badge key={user} variant="outline" className="text-xs">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Panel */}
        {isConfiguring && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Superset Configuration</CardTitle>
              <CardDescription className="text-sm">
                Configure your Superset instance and dashboard settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Basic Settings</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supersetDomain" className="text-sm">
                      Superset Domain
                    </Label>
                    <Input
                      id="supersetDomain"
                      value={config.supersetDomain}
                      onChange={(e) => setConfig((prev) => ({ ...prev, supersetDomain: e.target.value }))}
                      placeholder="http://localhost:8080"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Your Superset backend URL</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dashboardId" className="text-sm">
                      Dashboard ID
                    </Label>
                    <Input
                      id="dashboardId"
                      value={config.dashboardId}
                      onChange={(e) => setConfig((prev) => ({ ...prev, dashboardId: e.target.value }))}
                      placeholder="abc123"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">The ID from Superset embedding UI</p>
                  </div>
                </div>
              </div>
              <Separator />
              {/* UI Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Dashboard UI Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hideTitle"
                      checked={config.hideTitle}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, hideTitle: checked }))}
                    />
                    <Label htmlFor="hideTitle" className="text-sm">
                      Hide Title
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hideTab"
                      checked={config.hideTab}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, hideTab: checked }))}
                    />
                    <Label htmlFor="hideTab" className="text-sm">
                      Hide Tab
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hideChartControls"
                      checked={config.hideChartControls}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, hideChartControls: checked }))}
                    />
                    <Label htmlFor="hideChartControls" className="text-sm">
                      Hide Chart Controls
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="filtersVisible"
                      checked={config.filtersVisible}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, filtersVisible: checked }))}
                    />
                    <Label htmlFor="filtersVisible" className="text-sm">
                      Filters Visible
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 sm:col-span-2">
                    <Switch
                      id="filtersExpanded"
                      checked={config.filtersExpanded}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, filtersExpanded: checked }))}
                    />
                    <Label htmlFor="filtersExpanded" className="text-sm">
                      Filters Expanded
                    </Label>
                  </div>
                </div>
              </div>
              <Separator />
              {/* URL Parameters */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">URL Parameters</h4>
                <div className="space-y-2">
                  {Object.entries(config.urlParams).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        placeholder="Parameter name"
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value
                          const newUrlParams = { ...config.urlParams }
                          delete newUrlParams[key]
                          newUrlParams[newKey] = value
                          setConfig((prev) => ({ ...prev, urlParams: newUrlParams }))
                        }}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Parameter value"
                        value={value}
                        onChange={(e) => updateUrlParam(key, e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUrlParam(key)}
                        className="w-full sm:w-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUrlParam(`param${Object.keys(config.urlParams).length + 1}`, "")}
                    className="w-full sm:w-auto"
                  >
                    Add Parameter
                  </Button>
                </div>
              </div>
              <Separator />
              {/* Advanced Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Advanced Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="referrerPolicy" className="text-sm">
                    Referrer Policy
                  </Label>
                  <Input
                    id="referrerPolicy"
                    value={config.referrerPolicy}
                    onChange={(e) => setConfig((prev) => ({ ...prev, referrerPolicy: e.target.value }))}
                    placeholder="same-origin"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Iframe referrer policy (e.g., same-origin, no-referrer, etc.)
                  </p>
                </div>
              </div>
              <Button onClick={handleConfigSave} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration & Connect
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">{analyticsData.overview.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline mr-1 h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">{analyticsData.overview.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline mr-1 h-3 w-3" />
                +8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">{analyticsData.overview.totalChats.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline mr-1 h-3 w-3" />
                +23% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">{analyticsData.overview.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline mr-1 h-3 w-3" />
                -5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="superset" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="superset" className="text-xs sm:text-sm">
              Superset Dashboard
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              System Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              Performance
            </TabsTrigger>
          </TabsList>
          <TabsContent value="superset" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center text-lg sm:text-xl">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Embedded Superset Dashboard
                    {connectionStatus === "connecting" && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center text-sm">
                  <span>Advanced analytics and visualizations, Connected to:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-1 py-0.5 rounded text-xs break-all">{config.supersetDomain}</code>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={config.supersetDomain} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="w-full h-[400px] sm:h-[500px] lg:h-[600px] border rounded-lg bg-background"
                      style={{ minHeight: "400px", display: !dashboardLoaded ? "block" : "none" }}
                    >
                      {!dashboardLoaded && !error && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground text-center">Loading Superset dashboard...</p>
                          <p className="text-xs text-muted-foreground text-center break-all">
                            Connecting to: {config.supersetDomain}
                          </p>
                          <p className="text-xs text-muted-foreground text-center">
                            Dashboard ID: {config.dashboardId}
                          </p>
                          <div className="text-xs text-muted-foreground text-center">
                            <p className="font-medium mb-2">Configuration:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-left">
                              <div>Hide Title: {config.hideTitle ? "Yes" : "No"}</div>
                              <div>Hide Tab: {config.hideTab ? "Yes" : "No"}</div>
                              <div>Filters Visible: {config.filtersVisible ? "Yes" : "No"}</div>
                              <div>Filters Expanded: {config.filtersExpanded ? "Yes" : "No"}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      id="superset-container"
                      className="w-full h-[400px] sm:h-[500px] lg:h-[600px] border rounded-lg bg-background"
                      style={{ minHeight: "400px", display: dashboardLoaded ? "block" : "none" }}
                    ></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">System Overview</CardTitle>
                <CardDescription className="text-sm">High-level metrics and system health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] sm:h-[400px] flex items-center justify-center border rounded-lg bg-muted/10">
                  <div className="text-center p-4">
                    <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold">System Overview Charts</h3>
                    <p className="text-sm text-muted-foreground">Custom charts and metrics would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Performance Metrics</CardTitle>
                <CardDescription className="text-sm">
                  Detailed performance analytics and system monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] sm:h-[400px] flex items-center justify-center border rounded-lg bg-muted/10">
                  <div className="text-center p-4">
                    <Activity className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold">Performance Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Real-time performance metrics and monitoring data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
