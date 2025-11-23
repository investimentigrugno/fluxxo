import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Fluxxo
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Piattaforma avanzata di analisi finanziaria e gestione portfolio
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/screener">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              🚀 Inizia Screening
            </Button>
          </Link>
          <Link href="/analisi">
            <Button size="lg" variant="outline">
              🔍 Analizza Titolo
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <CardTitle>Stock Screener</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Scansione automatica di 100+ titoli con scoring algorithm avanzato
            </p>
            <Link href="/screener">
              <Button variant="outline" className="w-full">
                Apri Screener →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-purple-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <CardTitle>Analisi Fondamentale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Analisi completa con 50+ indicatori fondamentali e tecnici
            </p>
            <Link href="/analisi">
              <Button variant="outline" className="w-full">
                Analizza Titolo →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <CardTitle>Portfolio Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Gestione completa di proposte, ordini e transazioni
            </p>
            <Link href="/proposte">
              <Button variant="outline" className="w-full">
                Gestisci Portfolio →
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* Stats Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">100+</p>
              <p className="text-blue-100">Titoli Analizzati</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">50+</p>
              <p className="text-blue-100">Indicatori Tecnici</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">Real-time</p>
              <p className="text-blue-100">Dati TradingView</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-blue-100">Sempre Disponibile</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-8">Accesso Rapido</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/screener">
            <Badge className="px-4 py-2 text-base cursor-pointer hover:bg-blue-600">
              📊 Top 100 Stocks
            </Badge>
          </Link>
          <Link href="/analisi">
            <Badge className="px-4 py-2 text-base cursor-pointer hover:bg-purple-600">
              🔍 Cerca Ticker
            </Badge>
          </Link>
          <Link href="/proposte">
            <Badge className="px-4 py-2 text-base cursor-pointer hover:bg-green-600">
              💡 Nuova Proposta
            </Badge>
          </Link>
          <Link href="/ordini">
            <Badge className="px-4 py-2 text-base cursor-pointer hover:bg-orange-600">
              📋 Ordini Aperti
            </Badge>
          </Link>
          <Link href="/transazioni">
            <Badge className="px-4 py-2 text-base cursor-pointer hover:bg-pink-600">
              💰 Performance
            </Badge>
          </Link>
        </div>
      </div>

    </div>
  )
}
