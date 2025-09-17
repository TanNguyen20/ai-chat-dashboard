import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorHandlerProvider } from "@/contexts/ErrorStatus"
import { PermissionProvider } from "@/contexts/permission"
import AiChat from "@/components/ai-chat-script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "A modern admin dashboard built with Next.js",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorHandlerProvider>
            <AuthProvider>
              <PermissionProvider>
                {children}
              </PermissionProvider>
            </AuthProvider>
            <Toaster />
          </ErrorHandlerProvider>
        </ThemeProvider>
        <AiChat apiKey="LNo8UU2+Yi6NgVKV7FM3X8vdNCf3bSB3SALDa3GCUISFhfFCXg6yi1N3lWtgjJpn" />
      </body>
    </html>
  )
}
