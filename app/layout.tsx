import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DialogProvider } from "@/contexts/dialog-context"
import { AnalyticsWrapper } from "@/components/analytics-wrapper"
import { StructuredData } from "@/components/StructuredData"
import { metadata as siteMetadata } from "./metadata"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <DialogProvider>{children}</DialogProvider>
          </ThemeProvider>
          <AnalyticsWrapper />
        </Suspense>
      </body>
    </html>
  )
}
