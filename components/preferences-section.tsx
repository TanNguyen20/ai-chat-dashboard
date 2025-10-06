"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface PreferencesSectionProps {
  user: {
    timezone: string
    language: string
    emailNotifications: boolean
    marketingEmails: boolean
  }
  onSave: (updates: Partial<PreferencesSectionProps["user"]>) => void
}

export function PreferencesSection({ user, onSave }: PreferencesSectionProps) {
  const [preferences, setPreferences] = useState({
    timezone: user.timezone,
    language: user.language,
    emailNotifications: user.emailNotifications,
    marketingEmails: user.marketingEmails,
  })
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  const handleChange = (key: string, value: string | boolean) => {
    setPreferences({ ...preferences, [key]: value })
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(preferences)
    setHasChanges(false)
    toast({
      title: "Success",
      description: "Your preferences have been updated",
    })
    console.log("[v0] Preferences saved:", preferences)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience and notification settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={preferences.timezone} onValueChange={(value) => handleChange("timezone", value)}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={preferences.language} onValueChange={(value) => handleChange("language", value)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-medium text-foreground">Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications" className="text-sm font-normal">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">Receive notifications about your account activity</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketingEmails" className="text-sm font-normal">
                Marketing Emails
              </Label>
              <p className="text-xs text-muted-foreground">Receive updates about new features and promotions</p>
            </div>
            <Switch
              id="marketingEmails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => handleChange("marketingEmails", checked)}
            />
          </div>
        </div>

        {hasChanges && (
          <div className="flex gap-3 border-t pt-6">
            <Button onClick={handleSave}>Save Preferences</Button>
            <Button
              variant="outline"
              onClick={() => {
                setPreferences({
                  timezone: user.timezone,
                  language: user.language,
                  emailNotifications: user.emailNotifications,
                  marketingEmails: user.marketingEmails,
                })
                setHasChanges(false)
              }}
            >
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
