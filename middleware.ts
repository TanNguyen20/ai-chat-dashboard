import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This middleware runs on every request
  // The actual authentication logic is handled in the AuthProvider component
  // This is just a placeholder for any server-side middleware logic you might need

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
