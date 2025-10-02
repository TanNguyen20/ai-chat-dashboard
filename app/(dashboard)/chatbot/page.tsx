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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { useAuth } from "@/contexts/Authentication"
import { toast } from "@/hooks/use-toast"
import { ChatbotService, type Chatbot, type ChatbotRequest } from "@/services/chatbot"
import type { Page } from "@/types/pagination"
import {
  Bot,
  Calendar,
  Check,
  Copy,
  Edit,
  Globe,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { useEffect, useState } from "react"

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
  const [paginationData, setPaginationData] = useState<Page<Chatbot> | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copiedApiKeys, setCopiedApiKeys] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [formData, setFormData] = useState<ChatbotRequest>({
    name: "",
    allowedHost: "",
    themeColor: "blue",
  })
  const [editFormData, setEditFormData] = useState<ChatbotRequest>({
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
  }, [currentPage, pageSize])

  const fetchChatbots = async () => {
    try {
      setLoading(true)
      const data = await ChatbotService.getChatbotList({
        page: currentPage,
        size: pageSize,
        sort: "createdAt,desc",
      })
      setPaginationData(data)
      setChatbots(data.content)
      setError("")
    } catch (error: any) {
      console.error("Failed to fetch chatbots:", error)
      setError("Failed to load chatbots")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await fetchChatbots()
      toast({
        title: "Refreshed",
        description: "Chatbot data has been updated",
      })
    } catch (error: any) {
      console.error("Failed to refresh chatbots:", error)
      setError("Failed to refresh chatbots")
      toast({
        title: "Error",
        description: "Failed to refresh chatbot data",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAddChatbot = async () => {
    if (!formData.name || !formData.allowedHost || !formData.themeColor) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsCreating(true)
      await ChatbotService.createChatbot(formData)
      setFormData({ name: "", allowedHost: "", themeColor: "blue" })
      setIsAddDialogOpen(false)
      setSuccess("Chatbot created successfully")
      setError("")
      setCurrentPage(0)
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
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateChatbot = async () => {
    if (!editingChatbot || !editFormData.name || !editFormData.allowedHost || !editFormData.themeColor) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsUpdating(true)
      await ChatbotService.updateChatbot(editingChatbot.id, editFormData)
      setIsEditDialogOpen(false)
      setEditingChatbot(null)
      setEditFormData({ name: "", allowedHost: "", themeColor: "blue" })
      setSuccess("Chatbot updated successfully")
      setError("")
      fetchChatbots()
      toast({
        title: "Success",
        description: "Chatbot updated successfully",
      })
    } catch (error: any) {
      console.error("Failed to update chatbot:", error)
      setError(error.response?.data?.message || "Failed to update chatbot")
      toast({
        title: "Error",
        description: "Failed to update chatbot",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
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

      fetchChatbots()

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number.parseInt(size))
    setCurrentPage(0) // Reset to first page when changing page size
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

  const openEditDialog = (chatbot: Chatbot) => {
    setEditingChatbot(chatbot)
    setEditFormData({
      name: chatbot.name,
      allowedHost: chatbot.allowedHost,
      themeColor: chatbot.themeColor,
    })
    setIsEditDialogOpen(true)
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

  const renderPagination = () => {
    if (!paginationData || paginationData.totalPages <= 1) return null

    const { totalPages, number: currentPageNumber, first, last } = paginationData
    const pages = []

    // Always show first page
    if (currentPageNumber > 2) {
      pages.push(0)
      if (currentPageNumber > 3) {
        pages.push(-1) // Ellipsis
      }
    }

    // Show pages around current page
    for (let i = Math.max(0, currentPageNumber - 1); i <= Math.min(totalPages - 1, currentPageNumber + 1); i++) {
      pages.push(i)
    }

    // Always show last page
    if (currentPageNumber < totalPages - 3) {
      if (currentPageNumber < totalPages - 4) {
        pages.push(-1) // Ellipsis
      }
      pages.push(totalPages - 1)
    }

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-full">
        <div className="flex flex-wrap items-center gap-2 text-sm min-w-0">
          <p className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
            Showing {paginationData.numberOfElements} of {paginationData.totalElements}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">per page</span>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end overflow-x-auto max-w-full">
          <Pagination>
            <PaginationContent className="flex-nowrap">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => !first && handlePageChange(currentPageNumber - 1)}
                  className={first ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {pages.map((page, index) => (
                <PaginationItem key={index}>
                  {page === -1 ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPageNumber}
                      className="cursor-pointer"
                    >
                      {page + 1}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => !last && handlePageChange(currentPageNumber + 1)}
                  className={last ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 max-w-full overflow-x-hidden">
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
                <div className="text-2xl font-bold">{paginationData?.totalElements || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paginationData?.totalElements || 0}</div>
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
          <div className="flex flex-wrap justify-between items-start sm:items-center gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle>My Chatbots</CardTitle>
              <CardDescription>Manage your chatbots and their configurations</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline sm:inline">Refresh</span>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Add Chatbot</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] mx-4">
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
                      <Button onClick={handleAddChatbot} disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Creating Chatbot...</span>
                            <span className="sm:hidden">Creating...</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Create Chatbot</span>
                            <span className="sm:hidden">Create</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chatbots.map((chatbot) => (
                  <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2 min-w-0 truncate">
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${getThemeColorClass(chatbot.themeColor)}`}
                          />
                          <span className="truncate">{chatbot.name}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary">Active</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(chatbot)}>
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate min-w-0">{chatbot.allowedHost}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Palette className="h-4 w-4 flex-shrink-0" />
                        <span className="capitalize">{chatbot.themeColor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                        <Bot className="h-4 w-4 flex-shrink-0" />
                        <span className="font-mono text-xs truncate min-w-0">{maskApiKey(chatbot.apiKey)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted flex-shrink-0"
                          onClick={() => copyApiKey(chatbot.apiKey, chatbot.id)}
                        >
                          {copiedApiKeys.has(chatbot.id) ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate min-w-0">Created {formatDate(chatbot.createdAt)}</span>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={() => openEditDialog(chatbot)}
                        >
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6">{renderPagination()}</div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Edit Chatbot</DialogTitle>
            <DialogDescription>Update your chatbot's name, allowed hosts, and theme color.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-chatbot-name">Chatbot Name</Label>
              <Input
                id="edit-chatbot-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter chatbot name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-allowed-host">Allowed Hosts</Label>
              <Input
                id="edit-allowed-host"
                value={editFormData.allowedHost}
                onChange={(e) => setEditFormData({ ...editFormData, allowedHost: e.target.value })}
                placeholder="localhost,example.com"
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of allowed domains</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-theme-color">Theme Color</Label>
              <Select
                value={editFormData.themeColor}
                onValueChange={(value) => setEditFormData({ ...editFormData, themeColor: value })}
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
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateChatbot} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Updating Chatbot...</span>
                    <span className="sm:hidden">Updating...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Update Chatbot</span>
                    <span className="sm:hidden">Update</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
