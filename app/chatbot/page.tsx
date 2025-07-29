"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Bot,
  Users,
  Shield,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Settings,
  MessageSquare,
  Globe,
  Palette,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react"
import { ChatbotService, type Chatbot, type ChatbotRequest } from "@/services/chatbot"
import { LogoutConfirmation } from "@/components/logout-confirmation"
import { getHighestRole } from "@/utils/commons"
import { toast } from "@/hooks/use-toast"

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    isActive: false,
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
    isActive: true,
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

const themeColors = [
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
  { value: "indigo", label: "Indigo", color: "bg-indigo-500" },
  { value: "teal", label: "Teal", color: "bg-teal-500" },
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

export default function ChatbotPage() {
  const { user: currentUser, logout, isLoading } = useAuth()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState<ChatbotRequest>({
    name: "",
    allowedHost: "",
    themeColor: "blue",
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    chatbot: Chatbot | null
    isDeleting: boolean
  }>({
    isOpen: false,
    chatbot: null,
    isDeleting: false,
  })

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      setLoading(true)
      const data = await ChatbotService.getChatbotList()
      setChatbots(data)
      setError("")
    } catch (error: any) {
      console.error("Failed to fetch chatbots:", error)
      setError("Failed to load chatbots")
    } finally {
      setLoading(false)
    }
  }

  const handleAddChatbot = async () => {
    if (!formData.name || !formData.allowedHost || !formData.themeColor) {
      setError("Please fill in all fields")
      return
    }

    try {
      await ChatbotService.createChatbot(formData)
      setFormData({ name: "", allowedHost: "", themeColor: "blue" })
      setIsAddDialogOpen(false)
      setSuccess("Chatbot created successfully")
      setError("")
      fetchChatbots()
      toast({
        title: "Success",
        description: "Chatbot created successfully",
      })
    } catch (error: any) {
      console.error("Failed to create chatbot:", error)
      setError(error.response?.data?.message || "Failed to create chatbot")
      toast({
        title: "Error",
        description: "Failed to create chatbot",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChatbot = async () => {
    if (!deleteDialog.chatbot) return

    try {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: true }))
      await ChatbotService.deleteChatbot(deleteDialog.chatbot.id)

      // Remove the deleted chatbot from the list
      setChatbots((prev) => prev.filter((bot) => bot.id !== deleteDialog.chatbot?.id))

      setDeleteDialog({ isOpen: false, chatbot: null, isDeleting: false })
      setSuccess("Chatbot deleted successfully")
      setError("")

      toast({
        title: "Success",
        description: `Chatbot "${deleteDialog.chatbot.name}" has been deleted`,
      })
    } catch (error: any) {
      console.error("Failed to delete chatbot:", error)
      setError(error.response?.data?.message || "Failed to delete chatbot")
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }))

      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      })
    }
  }

  const openDeleteDialog = (chatbot: Chatbot) => {
    setDeleteDialog({
      isOpen: true,
      chatbot,
      isDeleting: false,
    })
  }

  const closeDeleteDialog = () => {
    if (!deleteDialog.isDeleting) {
      setDeleteDialog({
        isOpen: false,
        chatbot: null,
        isDeleting: false,
      })
    }
  }

  const handleLogout = async () => {
    setShowLogoutDialog(false)
    await logout()
  }

  const openAddDialog = () => {
    setFormData({ name: "", allowedHost: "", themeColor: "blue" })
    setIsAddDialogOpen(true)
    setError("")
  }

  const getThemeColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      teal: "bg-teal-500",
    }
    return colorMap[color] || "bg-blue-500"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar showLogoutDialog={showLogoutDialog} setShowLogoutDialog={setShowLogoutDialog} />
      <SidebarInset>
        {/* Header */}
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
                <BreadcrumbPage>Chatbot</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-4 p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chatbots.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chatbots.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    chatbots.filter((bot) => {
                      const created = new Date(bot.createdAt)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length
                  }
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

          {/* Chatbot Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Chatbots</CardTitle>
                  <CardDescription>Manage your chatbots and their configurations</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog} className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Chatbot</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Chatbot</DialogTitle>
                      <DialogDescription>
                        Configure your new chatbot with a name, allowed hosts, and theme color.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="chatbot-name">Chatbot Name</Label>
                        <Input
                          id="chatbot-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter chatbot name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allowed-host">Allowed Hosts</Label>
                        <Input
                          id="allowed-host"
                          value={formData.allowedHost}
                          onChange={(e) => setFormData({ ...formData, allowedHost: e.target.value })}
                          placeholder="localhost,example.com"
                        />
                        <p className="text-xs text-muted-foreground">Comma-separated list of allowed domains</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="theme-color">Theme Color</Label>
                        <Select
                          value={formData.themeColor}
                          onValueChange={(value) => setFormData({ ...formData, themeColor: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme color" />
                          </SelectTrigger>
                          <SelectContent>
                            {themeColors.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${color.color}`} />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddChatbot}>Create Chatbot</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading chatbots...</div>
                </div>
              ) : chatbots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No chatbots yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first chatbot to get started</p>
                  <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Chatbot
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chatbots.map((chatbot) => (
                    <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getThemeColorClass(chatbot.themeColor)}`} />
                            {chatbot.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Active</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => openDeleteDialog(chatbot)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          <span className="truncate">{chatbot.allowedHost}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Palette className="h-4 w-4" />
                          <span className="capitalize">{chatbot.themeColor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(chatbot.createdAt)}</span>
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog.chatbot?.name}"? This action cannot be undone and will
                permanently remove the chatbot and all its configurations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteDialog.isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChatbot}
                disabled={deleteDialog.isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {deleteDialog.isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <LogoutConfirmation
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
          onConfirm={handleLogout}
          isLoading={isLoading}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
