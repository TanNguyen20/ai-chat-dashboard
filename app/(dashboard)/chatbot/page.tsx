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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Bot,
  MessageSquare,
  Globe,
  Palette,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Copy,
  Check,
} from "lucide-react"
import { ChatbotService, type Chatbot, type ChatbotRequest } from "@/services/chatbot"
import { toast } from "@/hooks/use-toast"

const themeColors = [
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
  { value: "indigo", label: "Indigo", color: "bg-indigo-500" },
  { value: "teal", label: "Teal", color: "bg-teal-500" },
  { value: "lightyellow", label: "Light Yellow", color: "bg-yellow-200" },
]

export default function ChatbotPage() {
  const { user: currentUser } = useAuth()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copiedApiKeys, setCopiedApiKeys] = useState<Set<string>>(new Set())
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
      lightyellow: "bg-yellow-200",
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

  const maskApiKey = (apiKey: string) => {
    if (!apiKey) return ""
    return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
  }

  const copyApiKey = async (apiKey: string, chatbotId: string) => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopiedApiKeys((prev) => new Set(prev).add(chatbotId))
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      })

      setTimeout(() => {
        setCopiedApiKeys((prev) => {
          const newSet = new Set(prev)
          newSet.delete(chatbotId)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy API key",
        variant: "destructive",
      })
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="pt-2">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                      <Bot className="h-4 w-4" />
                      <span className="font-mono text-xs">{maskApiKey(chatbot.apiKey)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={() => copyApiKey(chatbot.apiKey, chatbot.id)}
                      >
                        {copiedApiKeys.has(chatbot.id) ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
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
    </div>
  )
}
