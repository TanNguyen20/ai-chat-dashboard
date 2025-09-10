"use client"
import { Shield, Settings, Users, Bell, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleAccessSettings } from "@/components/role-access-settings"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 p-3 sm:p-4">
        <Tabs defaultValue="access-control" className="w-full">
          <div className="mb-6 overflow-x-auto">
            <TabsList className="grid grid-cols-5 w-full min-w-[640px] md:min-w-0 md:grid-cols-5">
              <TabsTrigger value="access-control" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Shield className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Access Control</span>
                <span className="sm:hidden">Access</span>
              </TabsTrigger>
              <TabsTrigger value="user-management" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Bell className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Lock className="h-3 w-3 md:h-4 md:w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="general" className="gap-1 md:gap-2 text-xs md:text-sm">
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
                General
              </TabsTrigger>
            </TabsList>
          </div>

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
