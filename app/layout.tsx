import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flusso - Portfolio Management',
  description: 'Sistema di gestione portfolio intelligente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">📊 Flusso</h1>
              <div className="flex gap-4">
                <a href="/" className="hover:text-blue-600">Home</a>
                <a href="/transazioni" className="hover:text-blue-600">Transazioni</a>
                <a href="/proposte" className="hover:text-blue-600">Proposte</a>
                <a href="/ordini" className="hover:text-blue-600">Ordini</a>
                <a href="/screener" className="hover:text-blue-600">Screener</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}
