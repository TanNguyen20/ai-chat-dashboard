"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "@/components/profile-header"
import { PersonalInfoSection } from "@/components/personal-info-section"
import { SecuritySection } from "@/components/security-section"
import { PreferencesSection } from "@/components/preferences-section"
import { useAuth } from "@/contexts/Authentication"
import { User, UserProfileInfo } from "@/types/user"
import { getHighestRole } from "@/utils/commons"
import { UserService } from "@/services/user"

const convertUserAuthToProfileInfo = (userAuth: User): UserProfileInfo => {
  return {
    id: userAuth.id,
    fullName: userAuth.fullName || "",
    email: userAuth.email || "",
    avatar: "/professional-avatar.jpg",
    bio: `Permissons: ${getHighestRole(userAuth)}`,
    location: "Vietnam, Ho Chi Minh",
    joinedDate: userAuth.createdAt,
    timezone: "Vietnam/Ho_Chi_Minh",
    language: "English",
    emailNotifications: true,
    marketingEmails: false,
  }
}

export default function ProfilePage() {
  const { user: userAuth } = useAuth()
  const [user, setUser] = useState<UserProfileInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (userAuth) {
      setUser(convertUserAuthToProfileInfo(userAuth))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userAuth)])

  const handleSave = async (updates: Partial<UserProfileInfo>) => {
    if (!user) return

    // Optimistic update
    const prev = user
    const next = { ...user, ...updates }
    setUser(next)
    setIsEditing(false)

    try {
      // Only send fields backend expects
      await UserService.updateProfileInfo({
        email: updates.email ?? prev.email,
        fullName: updates.fullName ?? prev.fullName,
      })
      console.log("[profile] Saved user data to backend:", updates)
    } catch (error) {
      console.error("[profile] Failed to save user data:", error)
      // Roll back if the request fails
      setUser(prev)
      setIsEditing(true)
    }
  }

  return user && (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Profile Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          <ProfileHeader user={user} onSave={handleSave} />

          <PersonalInfoSection
            user={user}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />

          <SecuritySection />

          <PreferencesSection user={user} onSave={handleSave} />
        </div>
      </div>
    </div>
  )
}
