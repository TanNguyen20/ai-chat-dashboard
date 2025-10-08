"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Camera } from "lucide-react"
import type { UserProfileInfo } from "@/types/user"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

interface ProfileHeaderProps {
  user: UserProfileInfo
  onSave: (updates: { avatar?: string }) => void
}

export function ProfileHeader({ user, onSave }: ProfileHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        const reader = new FileReader()
        reader.onloadend = () => {
          const newAvatarUrl = reader.result as string
          setAvatarUrl(newAvatarUrl)
          onSave({ avatar: newAvatarUrl })
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Avatar upload failed:", error)
        setIsUploading(false)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {isUploading ? (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={user.fullName} />
                <AvatarFallback className="text-xl">{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Change avatar"
              >
                {isUploading ? <Spinner className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-foreground">{user.fullName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{user.bio}</p>
              <p className="mt-2 text-xs text-muted-foreground">Member since {user.joinedDate}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
