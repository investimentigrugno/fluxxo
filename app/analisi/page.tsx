'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function AnalisiPage() {
  const [tickerSearch, setTickerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [fundamentalData, setFundamentalData] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState('')

  async function handleSearch() {
    if (!tickerSearch) return
    
    setLoading(true)
    setFundamentalData(null)
    setAiAnalysis('')
    
    try {
      // Carica dati fondamentali
      const response = await fetch('/api/screener/fundamental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerSearch })
      })

      const data = await response.json()
      setFundamentalData(data.fundamentalData)
      
      // Richiedi analisi AI
      const aiResponse = await fetch('/api/screener/analyze-fundamental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticker: tickerSearch,
          data: data.fundamentalData 
        })
      })

      const aiData = await aiResponse.json()
      setAiAnalysis(aiData.analysis)

    } catch (error) {
      alert('Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Analisi Singolo Titolo</h1>

      {/* Barra Ricerca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cerca Ticker</CardTitle>
          <p className="text-sm text-gray-600">
            Inserisci il ticker nel formato: NASDAQ:AAPL, NYSE:TSLA, BINANCE:BTCUSDT
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Es: NASDAQ:AAPL"
              value={tickerSearch}
              onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={loading || !tickerSearch}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔍 Cerca'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!fundamentalData && !loading && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Inserisci un ticker per iniziare l'analisi
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Recupero dati da TradingView...</p>
          </CardContent>
        </Card>
      )}

      {fundamentalData && (
        <Tabs defaultValue="dati">
          <TabsList>
            <TabsTrigger value="dati">📊 Dati Fondamentali</TabsTrigger>
            <TabsTrigger value="tecnici">📈 Indicatori Tecnici</TabsTrigger>
            <TabsTrigger value="analisi">🤖 Analisi AI</TabsTrigger>
          </TabsList>

          {/* DATI FONDAMENTALI */}
          <TabsContent value="dati">
            <Card>
              <CardHeader>
                <CardTitle>Dati Fondamentali - {tickerSearch}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-600">Prezzo</p>
                    <p className="text-lg font-bold">${fundamentalData.close?.toFixed(2)}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-600">Market Cap</p>
                    <p className="text-lg font-bold">
                      {(fundamentalData.market_cap_basic / 1e9).toFixed(2)}B
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-600">P/E Ratio</p>
                    <p className="text-lg font-bold">{fundamentalData.price_earnings_ttm}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-600">ROE</p>
                    <p className="text-lg font-bold">{(fundamentalData.return_on_equity * 100).toFixed(1)}%</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-600">Debt/Equity</p>
                    <p className="text-lg font-bold">{fundamentalData.debt_to_equity}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-600">Current Ratio</p>
                    <p className="text-lg font-bold">{fundamentalData.current_ratio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INDICATORI TECNICI */}
          <TabsContent value="tecnici">
            <Card>
              <CardHeader>
                <CardTitle>Indicatori Tecnici</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">RSI (14)</p>
                    <p className="text-3xl font-bold">{fundamentalData.RSI?.toFixed(1)}</p>
                    <Badge variant={
                      fundamentalData.RSI > 70 ? 'destructive' :
                      fundamentalData.RSI < 30 ? 'default' : 'secondary'
                    }>
                      {fundamentalData.RSI > 70 ? 'Ipercomprato' :
                       fundamentalData.RSI < 30 ? 'Ipervenduto' : 'Neutrale'}
                    </Badge>
                  </div>

                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">MACD</p>
                    <p className="text-2xl font-bold">{fundamentalData['MACD.macd']?.toFixed(4)}</p>
                    <p className="text-xs text-gray-600">
                      Signal: {fundamentalData['MACD.signal']?.toFixed(4)}
                    </p>
                  </div>

                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">SMA 50</p>
                    <p className="text-2xl font-bold">${fundamentalData.SMA50?.toFixed(2)}</p>
                  </div>

                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">SMA 200</p>
                    <p className="text-2xl font-bold">${fundamentalData.SMA200?.toFixed(2)}</p>
                  </div>

                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">Volatilità</p>
                    <p className="text-2xl font-bold">{fundamentalData['Volatility.D']?.toFixed(2)}%</p>
                  </div>

                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">Rating Tecnico</p>
                    <Badge className="text-lg">
                      {fundamentalData.TechnicalRating}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALISI AI */}
          <TabsContent value="analisi">
            {aiAnalysis && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>🤖 Analisi AI (Groq)</CardTitle>
                    <Badge>Llama 3.1</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none whitespace-pre-line">
                    {aiAnalysis}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
