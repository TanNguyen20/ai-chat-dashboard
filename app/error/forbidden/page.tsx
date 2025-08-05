import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldX, Home, LogIn } from "lucide-react"
import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="w-10 h-10 text-red-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-red-900">403</h1>
              <h2 className="text-xl font-semibold text-red-700">Access Forbidden</h2>
              <p className="text-red-600 text-sm">
                {
                  "You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
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
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
