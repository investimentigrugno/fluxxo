'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function ScreenerPage() {
  const [tickerSearch, setTickerSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [fundamentalData, setFundamentalData] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState('')

  async function handleSearch() {
    if (!tickerSearch) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/screener/fundamental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerSearch })
      })

      const data = await response.json()
      setFundamentalData(data.fundamentalData)
      
      // Get AI analysis
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
      <h1 className="text-3xl font-bold mb-6">🔍 Screener & Analisi AI</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cerca Ticker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Es: NASDAQ:AAPL"
              value={tickerSearch}
              onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
              className="flex-1"
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

      {fundamentalData && (
        <Tabs defaultValue="dati">
          <TabsList>
            <TabsTrigger value="dati">Dati Fondamentali</TabsTrigger>
            <TabsTrigger value="analisi">Analisi AI</TabsTrigger>
          </TabsList>

          <TabsContent value="dati">
            <Card>
              <CardHeader>
                <CardTitle>Dati Fondamentali - {tickerSearch}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(fundamentalData).map(([key, value]: [string, any]) => (
                    <div key={key} className="border rounded p-3">
                      <p className="text-xs text-gray-600 uppercase">{key}</p>
                      <p className="font-semibold">
                        {typeof value === 'number' ? value.toLocaleString('it-IT') : value || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <div className="prose max-w-none">
                    {aiAnalysis.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-3">{line}</p>
                    ))}
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
