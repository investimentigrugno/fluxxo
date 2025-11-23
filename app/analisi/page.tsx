'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

'use client'

export default function AnalisiPage() {
  
  // States
  const [tickerSearch, setTickerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [fundamentalData, setFundamentalData] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState('')

  // Function handleSearch
  async function handleSearch() {
    if (!tickerSearch) return
    
    setLoading(true)
    setFundamentalData(null)
    setAiAnalysis('')
    
    try {
      const response = await fetch('/api/screener/fundamental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerSearch })
      })

      const data = await response.json()
      
      if (data.error) {
        alert(`Errore: ${data.error}`)
        return
      }
      
      setFundamentalData(data.fundamentalData)

    } catch (error: any) {
      alert('Errore nel caricamento dati')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // JSX Return
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Analisi Singolo Titolo</h1>

      {/* Barra Ricerca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cerca Ticker</CardTitle>
          <p className="text-sm text-gray-600">
            Inserisci il ticker nel formato: NASDAQ:AAPL, NYSE:TSLA, MIL:ENEL
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

      {/* Stati: Nessun dato, Loading, Dati */}
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
          </TabsList>

          <TabsContent value="dati">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Card>
                <CardHeader>
                  <CardTitle>💰 Valutazione</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prezzo:</span>
                    <span className="font-bold">${fundamentalData.close?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Cap:</span>
                    <span className="font-semibold">
                      ${(fundamentalData.market_cap_basic / 1e9)?.toFixed(2)}B
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/E Ratio:</span>
                    <span className="font-semibold">
                      {fundamentalData.price_earnings_ttm?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          <TabsContent value="tecnici">
            <Card>
              <CardHeader>
                <CardTitle>Indicatori Tecnici</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">RSI</p>
                    <p className="text-2xl font-bold">{fundamentalData.RSI?.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">MACD</p>
                    <p className="text-2xl font-bold">{fundamentalData['MACD.macd']?.toFixed(3)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

