import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "MarketingOS — Learn by Doing",
  description:
    "Platform belajar marketing interaktif. 19 modul sistem marketing terstruktur dengan task praktek, daily log, dan streak tracker.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
