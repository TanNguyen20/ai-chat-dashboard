import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserX, LogIn, Home } from "lucide-react"
import Link from "next/link"

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <UserX className="w-10 h-10 text-orange-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-orange-900">401</h1>
              <h2 className="text-xl font-semibold text-orange-700">Authentication Required</h2>
              <p className="text-orange-600 text-sm">
                {"You need to sign in to access this page. Please log in with your credentials to continue."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
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
