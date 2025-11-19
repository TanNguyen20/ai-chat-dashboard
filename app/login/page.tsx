"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/Authentication"
import { Loader2, LayoutDashboard, Activity, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      await login(username, password)
    } catch (error: any) {
      setError(error?.description || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const loginWithMicrosoft = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_OAUTH2_BASE_URL}/oauth2/authorization/azure`
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Column - Dashboard Info */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:px-16 bg-muted/30">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Welcome to Your Command Center</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Access your comprehensive dashboard to manage services, monitor system status, and oversee all
            administrative functions in one unified platform.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Real-time Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Track active services and system status with live updates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">Secure authentication with granular permission controls</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Activity Tracking</h3>
                <p className="text-sm text-muted-foreground">View recent activity and login history at a glance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={loginWithMicrosoft}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
                Sign in with Microsoft
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
