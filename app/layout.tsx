import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { generateMetadata } from "@/lib/metadata"
import { DynamicMetadata } from "@/components/dynamic-metadata"

export const metadata: Metadata = generateMetadata('en')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className} suppressHydrationWarning>
        <Providers>
          <DynamicMetadata />
          {children}
        </Providers>
      </body>
    </html>
  )
}
