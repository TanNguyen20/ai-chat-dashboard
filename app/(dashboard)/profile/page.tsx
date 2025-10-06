"use client"

import { useState } from "react"
import { ProfileHeader } from "@/components/profile-header"
import { PersonalInfoSection } from "@/components/personal-info-section"
import { SecuritySection } from "@/components/security-section"
import { PreferencesSection } from "@/components/preferences-section"

// Mock user data
const mockUser = {
  id: "1",
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatar: "/professional-avatar.png",
  bio: "Product designer and developer passionate about creating beautiful user experiences.",
  location: "San Francisco, CA",
  website: "https://alexjohnson.dev",
  joinedDate: "January 2024",
  timezone: "America/Los_Angeles",
  language: "English",
  emailNotifications: true,
  marketingEmails: false,
}

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (updates: Partial<typeof mockUser>) => {
    setUser({ ...user, ...updates })
    setIsEditing(false)
    // In a real app, this would make an API call to save the data
    console.log("[v0] Saving user data:", updates)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Profile Settings</h1>
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
