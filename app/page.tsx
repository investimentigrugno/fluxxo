import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <CardTitle>Portfolio Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Portfolio manager with proposals, orders and transactions
            </p>
            <Link href="/portfolio">
              <Button variant="outline" className="w-full">
                Portfolio →
              </Button>
            </Link>
            <Link href="/transazioni">
              <Button variant="outline" className="w-full">
                Transactions →
              </Button>
            </Link>  
            <Link href="/proposte">
              <Button variant="outline" className="w-full">
                Proposals →
              </Button>
            </Link>
            <Link href="/ordini">
              <Button variant="outline" className="w-full">
                Orders →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <CardTitle>Stock Screener</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Top 100 stocks analyzed with investment score in real time
            </p>
            <Link href="/screener">
              <Button variant="outline" className="w-full">
                Open Screener →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-purple-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <CardTitle>Stock analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Fundamental and technical analysis with TradingView chart integration
            </p>
            <Link href="/analisi">
              <Button variant="outline" className="w-full">
                Analyze stock →
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
              <p className="text-blue-100">Stocks analyzed</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">Algo Score</p>
              <p className="text-blue-100">Advanced screening with algo score</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">Real-time</p>
              <p className="text-blue-100">TradingView Data</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
