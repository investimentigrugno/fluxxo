'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  async function loadScreenerData() {
  setLoading(true)
  
  try {
    const response = await fetch('/api/screener/multi-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Nessun filtro
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
  const top5 = stocks
    .sort((a, b) => b.InvestmentScore - a.InvestmentScore)
    .slice(0, 5)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Screener Multi-Asset</h1>

      {/* Titolo e Refresh */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📊 Top 100 Stock Screener</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                100 migliori titoli filtrati da TradingView con Investment Score
              </p>
              <Button 
                onClick={() => loadScreenerData()}
                disabled={loading}
              >
                {loading ? '⏳ Caricamento...' : '🔄 Aggiorna Dati'}
              </Button>
            </div>
          </CardContent>
        </Card>


      {loading && (
        <div className="text-center py-12">
          <p className="text-xl">⏳ Scansione mercati in corso...</p>
        </div>
      )}

      {!loading && (
        <Tabs defaultValue="top5">
          <TabsList>
            <TabsTrigger value="top5">🏆 Top 5 Picks</TabsTrigger>
            <TabsTrigger value="all">📊 Tutti ({stocks.length})</TabsTrigger>
          </TabsList>

          {/* TOP 5 PICKS */}
          <TabsContent value="top5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {top5.map((stock, idx) => (
                <Card key={stock.name} className="bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{stock.name}</CardTitle>
                        <p className="text-sm text-gray-600">{stock.market}</p>
                      </div>
                      <Badge className="text-2xl">#{idx + 1}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-4xl font-bold text-green-600">
                        {stock.InvestmentScore}/100
                      </p>
                      <p className="text-sm text-gray-600">Investment Score</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Prezzo:</span>
                        <span className="font-semibold">${stock.close?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RSI:</span>
                        <span className="font-semibold">{stock.RSI?.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volatilità:</span>
                        <span className="font-semibold">{stock['Volatility.D']?.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating Tecnico:</span>
                        <Badge variant={stock['Recommend.All'] > 0.3 ? 'default' : 'secondary'}>
                          {stock.TechnicalRating}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 p-2 bg-white rounded border">
                      <p className="text-xs font-semibold">💡 Motivi:</p>
                      <p className="text-xs">{stock.RecommendationReason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TABELLA COMPLETA */}
          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Prezzo</TableHead>
                      <TableHead className="text-right">RSI</TableHead>
                      <TableHead className="text-right">MACD</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead className="text-right">Volatilità</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.map((stock, idx) => (
                      <TableRow key={stock.name}>
                        <TableCell className="font-bold">#{idx + 1}</TableCell>
                        <TableCell className="font-semibold">{stock.name}</TableCell>
                        <TableCell>
                          <Badge variant={stock.InvestmentScore > 70 ? 'default' : 'secondary'}>
                            {stock.InvestmentScore}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${stock.close?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{stock.RSI?.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{stock['MACD.macd']?.toFixed(3)}</TableCell>
                        <TableCell>
                          <Badge variant={stock.TrendScore > 7 ? 'default' : 'outline'}>
                            {stock.TrendScore}/10
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{stock['Volatility.D']?.toFixed(2)}%</TableCell>
                        <TableCell>
                          <span className={`text-xs ${
                            stock['Recommend.All'] > 0.3 ? 'text-green-600' : 
                            stock['Recommend.All'] < -0.3 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {stock.TechnicalRating}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
