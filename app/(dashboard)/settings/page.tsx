"use client"
import { Shield, Settings, Users, Bell, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleAccessSettings } from "@/components/role-access-settings"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="access-control" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="access-control" className="gap-2">
              <Shield className="h-4 w-4" />
              Access Control
            </TabsTrigger>
            <TabsTrigger value="user-management" className="gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access-control" className="mt-0">
            <RoleAccessSettings />
          </TabsContent>

          <TabsContent value="user-management" className="mt-0">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">User Management</h3>
              <p className="text-muted-foreground">User management settings will be available here.</p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Notifications</h3>
              <p className="text-muted-foreground">Notification settings will be available here.</p>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <div className="text-center py-12">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Security</h3>
              <p className="text-muted-foreground">Security settings will be available here.</p>
            </div>
          </TabsContent>

          <TabsContent value="general" className="mt-0">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">General Settings</h3>
              <p className="text-muted-foreground">General application settings will be available here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
