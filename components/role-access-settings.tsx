"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Edit, Plus, MoreVertical } from "lucide-react"

interface PageAccess {
  id: string
  url: string
  description: string
  roles: string[]
  permissions: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
}

interface Role {
  id: string
  name: string
  color: string
}

const mockRoles: Role[] = [
  { id: "1", name: "Admin", color: "bg-red-100 text-red-800" },
  { id: "2", name: "Editor", color: "bg-blue-100 text-blue-800" },
  { id: "3", name: "Viewer", color: "bg-green-100 text-green-800" },
  { id: "4", name: "Moderator", color: "bg-purple-100 text-purple-800" },
]

const mockPageAccess: PageAccess[] = [
  {
    id: "1",
    url: "/dashboard",
    description: "Main dashboard with analytics and overview",
    roles: ["Admin", "Editor"],
    permissions: { create: true, read: true, update: true, delete: false },
  },
  {
    id: "2",
    url: "/users",
    description: "User management and profiles",
    roles: ["Admin"],
    permissions: { create: true, read: true, update: true, delete: true },
  },
  {
    id: "3",
    url: "/content",
    description: "Content management system",
    roles: ["Admin", "Editor", "Moderator"],
    permissions: { create: true, read: true, update: true, delete: false },
  },
  {
    id: "4",
    url: "/reports",
    description: "Analytics and reporting dashboard",
    roles: ["Admin", "Viewer"],
    permissions: { create: false, read: true, update: false, delete: false },
  },
]

export function RoleAccessSettings() {
  const [pageAccess, setPageAccess] = useState<PageAccess[]>(mockPageAccess)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<PageAccess | null>(null)
  const [newPage, setNewPage] = useState<Partial<PageAccess>>({
    url: "",
    description: "",
    roles: [],
    permissions: { create: false, read: true, update: false, delete: false },
  })

  const handleAddPage = () => {
    if (newPage.url && newPage.description) {
      const page: PageAccess = {
        id: Date.now().toString(),
        url: newPage.url,
        description: newPage.description,
        roles: newPage.roles || [],
        permissions: newPage.permissions || { create: false, read: true, update: false, delete: false },
      }
      setPageAccess([...pageAccess, page])
      setNewPage({
        url: "",
        description: "",
        roles: [],
        permissions: { create: false, read: true, update: false, delete: false },
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeletePage = (id: string) => {
    setPageAccess(pageAccess.filter((page) => page.id !== id))
  }

  const handleEditPage = (page: PageAccess) => {
    setEditingPage({ ...page })
  }

  const handleUpdatePage = () => {
    if (editingPage) {
      setPageAccess(pageAccess.map((page) => (page.id === editingPage.id ? editingPage : page)))
      setEditingPage(null)
    }
  }

  const toggleRole = (pageId: string, roleName: string) => {
    setPageAccess(
      pageAccess.map((page) => {
        if (page.id === pageId) {
          const roles = page.roles.includes(roleName)
            ? page.roles.filter((r) => r !== roleName)
            : [...page.roles, roleName]
          return { ...page, roles }
        }
        return page
      }),
    )
  }

  const togglePermission = (pageId: string, permission: keyof PageAccess["permissions"]) => {
    setPageAccess(
      pageAccess.map((page) => {
        if (page.id === pageId) {
          return {
            ...page,
            permissions: {
              ...page.permissions,
              [permission]: !page.permissions[permission],
            },
          }
        }
        return page
      }),
    )
  }

  const getRoleColor = (roleName: string) => {
    const role = mockRoles.find((r) => r.name === roleName)
    return role?.color || "bg-gray-100 text-gray-800"
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Role-Based Page Access</h2>
          <p className="text-muted-foreground text-pretty">
            Configure which roles can access specific pages and their CRUD permissions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Page</DialogTitle>
              <DialogDescription>Configure access settings for a new page URL</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Page URL</Label>
                <Input
                  id="url"
                  placeholder="/example-page"
                  value={newPage.url || ""}
                  onChange={(e) => setNewPage({ ...newPage, url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the page"
                  value={newPage.description || ""}
                  onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPage}>Add Page</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Page Access Cards */}
      <div className="space-y-4">
        {pageAccess.map((page) => (
          <Card key={page.id} className="border border-border">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium text-card-foreground">{page.url}</CardTitle>
                  <CardDescription className="text-pretty">{page.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditPage(page)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeletePage(page.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Roles Section */}
              <div>
                <Label className="text-sm font-medium text-card-foreground mb-3 block">Accessible Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {mockRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${page.id}-${role.id}`}
                        checked={page.roles.includes(role.name)}
                        onCheckedChange={() => toggleRole(page.id, role.name)}
                      />
                      <Badge
                        variant="secondary"
                        className={`${getRoleColor(role.name)} cursor-pointer`}
                        onClick={() => toggleRole(page.id, role.name)}
                      >
                        {role.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Section */}
              <div>
                <Label className="text-sm font-medium text-card-foreground mb-3 block">CRUD Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(page.permissions).map(([permission, enabled]) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${page.id}-${permission}`}
                        checked={enabled}
                        onCheckedChange={() => togglePermission(page.id, permission as keyof PageAccess["permissions"])}
                      />
                      <Label htmlFor={`${page.id}-${permission}`} className="text-sm capitalize cursor-pointer">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Page Access</DialogTitle>
            <DialogDescription>Update the page URL and description</DialogDescription>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-url">Page URL</Label>
                <Input
                  id="edit-url"
                  value={editingPage.url}
                  onChange={(e) => setEditingPage({ ...editingPage, url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingPage.description}
                  onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPage(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePage}>Update Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
