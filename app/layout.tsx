import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fluxxo - Financial Analysis Platform",
  description: "Advanced stock screening and portfolio management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {/* Navigation Bar */}
        <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fluxxo
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/portfolio">
                  <Button variant="ghost" className="font-medium">
                    🏠 Home
                  </Button>
                </Link>
                <Link href="/screener">
                  <Button variant="ghost" className="font-medium">
                    📊 Screener
                  </Button>
                </Link>
                <Link href="/analisi">
                  <Button variant="ghost" className="font-medium">
                    🔍 Analisi
                  </Button>
                </Link>
                <Link href="/proposte">
                  <Button variant="ghost" className="font-medium">
                    💡 Proposte
                  </Button>
                </Link>
                <Link href="/ordini">
                  <Button variant="ghost" className="font-medium">
                    📋 Ordini
                  </Button>
                </Link>
                <Link href="/transazioni">
                  <Button variant="ghost" className="font-medium">
                    💰 Transazioni
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm">
                  ☰
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white py-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p>© 2025 Fluxxo - Advanced Financial Analysis Platform</p>
            <p className="mt-2">Powered by TradingView & Supabase</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
