import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geistSans = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AutoMesh Learning | Cyber Network Journey | Dally R (230143)",
  description:
    "An immersive journey through self-healing mesh networks - from theory to production. Exploring network resilience, cyber threats, and real-world disaster prevention.",
  keywords: ["mesh networks", "self-healing", "cybersecurity", "WannaCry", "OSPF", "networking", "simulation"],
  authors: [{ name: "Dally R", url: "https://github.com/astro-dally" }],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0a1a0f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
