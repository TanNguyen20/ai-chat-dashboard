"use client"
import { Shield, Settings, Users, Bell, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleAccessSettings } from "@/components/role-access-settings"
import { Suspense } from "react"

const TabContentSkeleton = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <Skeleton className="h-6 w-48 mx-auto mb-2" />
    <Skeleton className="h-4 w-64 mx-auto" />
  </div>
)

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4">
        <Tabs defaultValue="access-control" className="w-full">
          <div className="mb-6">
            <TabsList className="grid grid-cols-5 w-full h-auto p-1">
              <TabsTrigger value="access-control" className="flex flex-col gap-1 py-2 px-1 text-xs">
                <Shield className="h-3 w-3" />
                <span className="hidden xs:inline text-[10px] leading-tight">Access</span>
              </TabsTrigger>
              <TabsTrigger value="user-management" className="flex flex-col gap-1 py-2 px-1 text-xs">
                <Users className="h-3 w-3" />
                <span className="hidden xs:inline text-[10px] leading-tight">Users</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col gap-1 py-2 px-1 text-xs">
                <Bell className="h-3 w-3" />
                <span className="hidden xs:inline text-[10px] leading-tight">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex flex-col gap-1 py-2 px-1 text-xs">
                <Lock className="h-3 w-3" />
                <span className="hidden xs:inline text-[10px] leading-tight">Security</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex flex-col gap-1 py-2 px-1 text-xs">
                <Settings className="h-3 w-3" />
                <span className="hidden xs:inline text-[10px] leading-tight">General</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="access-control" className="mt-0">
            <Suspense fallback={<TabContentSkeleton icon={Shield} title="Loading Access Control..." />}>
              <RoleAccessSettings />
            </Suspense>
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
