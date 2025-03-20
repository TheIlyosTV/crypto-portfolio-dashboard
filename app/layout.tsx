import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ReduxProvider from "@/providers/redux-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crypto Portfolio Dashboard",
  description: "Track your cryptocurrency portfolio with real-time price updates",
  openGraph: {
    title: "Crypto Portfolio Dashboard",
    description: "Track your cryptocurrency portfolio with real-time price updates",
    images: [
      {
        url: "https://crypto-portfolio-dashboard-tan.vercel.app/icons/crypto.jpg",
        width: 1200,
        height: 630,
        alt: "Crypto Portfolio Dashboard Preview",
      }
    ],
    type: "website",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}

