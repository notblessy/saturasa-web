import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { Providers } from "@/lib/providers"

export const metadata: Metadata = {
  title: "saturasa - Simplified ERP for FnB Business",
  description: "saturasa is an ERP for FnB business that simplifies operations and enhances efficiency.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "saturasa - Simplified ERP for FnB Business",
    description: "saturasa is an ERP for FnB business that simplifies operations and enhances efficiency.",
    url: "https://saturasa.id",
    siteName: "saturasa",
    images: [
      {
        url: "https://saturasa.id/og-image.png",
        width: 1200,
        height: 630,
        alt: "saturasa - Simplified ERP for FnB Business",
      },
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
