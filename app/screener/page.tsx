'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function loadScreenerData() {
    setLoading(true)
    
    try {
      const response = await fetch('/api/screener/multi-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()
      
      if (data.error) {
        alert(`Errore: ${data.error}`)
        return
      }
      
      setStocks(data.stocks || [])
      
    } catch (error: any) {
      console.error('Errore:', error)
      alert('Errore caricamento screener')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScreenerData()
  }, [])

  // Top 5 picks
  const topPicks = stocks.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        
        {/* Hero Header */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Stock Screener
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Top 100 titoli analizzati con investment score in tempo reale
          </p>
          <p className="text-sm text-gray-500">
            Powered by TradingView & Advanced Scoring Algorithm
          </p>
        </div>

        {/* Stats + Refresh Card */}
        <Card className="mb-8 border-2 border-blue-100 shadow-lg">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stocks.length}</p>
                  <p className="text-sm text-gray-600">Titoli Totali</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {stocks.filter(s => s.InvestmentScore > 70).length}
                  </p>
                  <p className="text-sm text-gray-600">Score {'>'} 70</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {stocks.filter(s => s['Recommend.All'] > 0.3).length}
                  </p>
                  <p className="text-sm text-gray-600">Strong Buy</p>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex flex-col items-end gap-2">
                <Button 
                  onClick={() => loadScreenerData()}
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Scansione in corso...
                    </>
                  ) : (
                    <>
                      🔄 Aggiorna Screening
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500">
                  Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-20 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-xl font-semibold text-gray-700">Scansione mercati in corso...</p>
              <p className="text-sm text-gray-500 mt-2">Analizzando 100+ titoli con TradingView</p>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {!loading && stocks.length > 0 && (
          <Tabs defaultValue="top5" className="space-y-6">
            
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
              <TabsTrigger value="top5" className="text-base">
                🏆 Top 5 Picks
              </TabsTrigger>
              <TabsTrigger value="all" className="text-base">
                📊 Tutti ({stocks.length})
              </TabsTrigger>
            </TabsList>

            {/* ========================================= */}
            {/* TAB 1: TOP 5 PICKS */}
            {/* ========================================= */}
            <TabsContent value="top5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {topPicks.map((stock, idx) => (
                  <Card 
                    key={stock.name} 
                    className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer overflow-hidden"
                  >
                    {/* Gradient Top Bar */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
                    
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-3 py-1">
                          #{idx + 1}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="text-lg font-bold border-2"
                        >
                          {stock.InvestmentScore}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{stock.name}</CardTitle>
                      <p className="text-xs text-gray-500">{stock.market || 'Global'}</p>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Prezzo */}
                      <div className="text-center py-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-gray-800">
                          ${stock.close?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">Prezzo Attuale</p>
                      </div>

                      {/* Metriche */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">RSI:</span>
                          <Badge variant={
                            stock.RSI > 70 ? 'destructive' :
                            stock.RSI < 30 ? 'default' : 'secondary'
                          }>
                            {stock.RSI?.toFixed(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">MACD:</span>
                          <span className={`font-semibold ${
                            stock['MACD.macd'] > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock['MACD.macd']?.toFixed(3)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Trend Score:</span>
                          <Badge variant={stock.TrendScore > 7 ? 'default' : 'secondary'}>
                            {stock.TrendScore}/10
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-600">Volatilità:</span>
                          <span className="font-semibold text-gray-800">
                            {stock['Volatility.D']?.toFixed(2)}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Rating:</span>
                          <Badge className={
                            stock['Recommend.All'] > 0.5 ? 'bg-green-600' :
                            stock['Recommend.All'] > 0.1 ? 'bg-blue-500' :
                            stock['Recommend.All'] > -0.1 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }>
                            {stock.TechnicalRating}
                          </Badge>
                        </div>
                      </div>

                      {/* Motivazione */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          💡 Motivi dell'investimento:
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {stock.RecommendationReason}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ========================================= */}
            {/* TAB 2: TABELLA COMPLETA */}
            {/* ========================================= */}
            <TabsContent value="all">
              <Card className="shadow-lg border-2 border-gray-100">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableHead className="font-bold">Rank</TableHead>
                          <TableHead className="font-bold">Ticker</TableHead>
                          <TableHead className="font-bold">Score</TableHead>
                          <TableHead className="text-right font-bold">Prezzo</TableHead>
                          <TableHead className="text-right font-bold">RSI</TableHead>
                          <TableHead className="text-right font-bold">MACD</TableHead>
                          <TableHead className="font-bold">Trend</TableHead>
                          <TableHead className="text-right font-bold">Volatilità</TableHead>
                          <TableHead className="font-bold">Rating Tecnico</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stocks.map((stock, idx) => (
                          <TableRow 
                            key={stock.name}
                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            {/* Rank */}
                            <TableCell className="font-bold">
                              <Badge variant={idx < 5 ? 'default' : 'secondary'}>
                                #{idx + 1}
                              </Badge>
                            </TableCell>

                            {/* Ticker */}
                            <TableCell>
                              <div>
                                <p className="font-semibold text-gray-900">{stock.name}</p>
                                <p className="text-xs text-gray-500">{stock.market || 'N/A'}</p>
                              </div>
                            </TableCell>

                            {/* Investment Score */}
                            <TableCell>
                              <Badge 
                                variant={
                                  stock.InvestmentScore > 80 ? 'default' :
                                  stock.InvestmentScore > 70 ? 'secondary' : 'outline'
                                }
                                className="text-base font-bold"
                              >
                                {stock.InvestmentScore}
                              </Badge>
                            </TableCell>

                            {/* Prezzo */}
                            <TableCell className="text-right font-semibold">
                              ${stock.close?.toFixed(2)}
                            </TableCell>

                            {/* RSI */}
                            <TableCell className="text-right">
                              <Badge variant={
                                stock.RSI > 70 ? 'destructive' :
                                stock.RSI < 30 ? 'default' : 'secondary'
                              }>
                                {stock.RSI?.toFixed(1)}
                              </Badge>
                            </TableCell>

                            {/* MACD */}
                            <TableCell className="text-right">
                              <span className={`font-semibold ${
                                stock['MACD.macd'] > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stock['MACD.macd']?.toFixed(3)}
                              </span>
                            </TableCell>

                            {/* Trend Score */}
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Badge variant={stock.TrendScore > 7 ? 'default' : 'outline'}>
                                  {stock.TrendScore}/10
                                </Badge>
                                {stock.TrendScore > 7 ? (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </TableCell>

                            {/* Volatilità */}
                            <TableCell className="text-right font-semibold">
                              {stock['Volatility.D']?.toFixed(2)}%
                            </TableCell>

                            {/* Rating Tecnico */}
                            <TableCell>
                              <Badge className={
                                stock['Recommend.All'] > 0.5 ? 'bg-green-600' :
                                stock['Recommend.All'] > 0.1 ? 'bg-blue-500' :
                                stock['Recommend.All'] > -0.1 ? 'bg-yellow-500' :
                                stock['Recommend.All'] > -0.5 ? 'bg-orange-500' : 'bg-red-500'
                              }>
                                {stock.TechnicalRating}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        )}

        {/* Empty State */}
        {!loading && stocks.length === 0 && (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-2xl text-gray-500 mb-4">📊 Nessun dato disponibile</p>
              <Button 
                onClick={() => loadScreenerData()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                🔄 Carica Screener
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
