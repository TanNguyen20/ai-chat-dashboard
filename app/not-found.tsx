"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-slate-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-slate-900">404</h1>
              <h2 className="text-xl font-semibold text-slate-700">Page Not Found</h2>
              <p className="text-slate-600 text-sm">
                {
                  "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL."
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
