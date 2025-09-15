"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home, Mail } from "lucide-react"
import Link from "next/link"

export default function DefaultErrorPage() {
  const errorCode = "Error"
  const title = "Something went wrong"
  const message = "An unexpected error occurred. Please try again or contact support if the problem persists."

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-gray-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-gray-900">{errorCode}</h1>
              <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleRefresh} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contact">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
