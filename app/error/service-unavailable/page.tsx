"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ServerCrash, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function ServiceUnavailablePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <ServerCrash className="w-10 h-10 text-yellow-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-yellow-900">503</h1>
              <h2 className="text-xl font-semibold text-yellow-700">Service Unavailable</h2>
              <p className="text-yellow-600 text-sm">
                {
                  "We're currently experiencing technical difficulties. Our team is working to resolve this issue. Please try again in a few minutes."
                }
              </p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
