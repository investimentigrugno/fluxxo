'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

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
  <div className="space-y-4">
    
    {/* Header Info Titolo */}
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{fundamentalData.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {fundamentalData.description} | {fundamentalData.country} | {fundamentalData.sector}
            </p>
          </div>
          <Badge className="text-xl px-4 py-2">
            ${fundamentalData.close?.toFixed(2)} {fundamentalData.currency}
          </Badge>
        </div>
      </CardHeader>
    </Card>

    <Tabs defaultValue="fondamentali">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="fondamentali">📊 Fondamentali</TabsTrigger>
        <TabsTrigger value="tecnici">📈 Tecnici</TabsTrigger>
        <TabsTrigger value="crescita">🚀 Crescita</TabsTrigger>
      </TabsList>

            {/* TAB 1: FONDAMENTALI */}
            <TabsContent value="fondamentali" className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Valutazione */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💰 Valutazione</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Market Cap</span>
                      <span className="font-semibold">
                        ${(fundamentalData.market_cap_basic / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">P/E Ratio (TTM)</span>
                      <span className="font-semibold">
                        {fundamentalData.price_earnings_ttm?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Price/Sales</span>
                      <span className="font-semibold">
                        {fundamentalData.price_sales_ratio?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Price/FCF (TTM)</span>
                      <span className="font-semibold">
                        {fundamentalData.price_free_cash_flow_ttm?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">EV/FCF (TTM)</span>
                      <span className="font-semibold">
                        {fundamentalData.enterprise_value_to_free_cash_flow_ttm?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Redditività */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📈 Redditività</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Operating Margin</span>
                      <span className="font-semibold">
                        {(fundamentalData.operating_margin * 100)?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Net Margin (TTM)</span>
                      <span className="font-semibold">
                        {(fundamentalData.net_margin_ttm * 100)?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">EBITDA</span>
                      <span className="font-semibold">
                        ${(fundamentalData.ebitda / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">EBIT (TTM)</span>
                      <span className="font-semibold">
                        ${(fundamentalData.ebit_ttm / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Income</span>
                      <span className="font-semibold">
                        ${(fundamentalData.net_income / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bilancio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🏛️ Bilancio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Total Assets</span>
                      <span className="font-semibold">
                        ${(fundamentalData.total_assets / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Total Debt</span>
                      <span className="font-semibold">
                        ${(fundamentalData.total_debt / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Total Liabilities</span>
                      <span className="font-semibold">
                        ${(fundamentalData.total_liabilities_fy / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Current Assets</span>
                      <span className="font-semibold">
                        ${(fundamentalData.total_current_assets / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Interest Rate on Debt</span>
                      <span className="font-semibold">
                        {(fundamentalData.effective_interest_rate_on_debt_fy * 100)?.toFixed(2)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Target Analisti */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Target Price Analisti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded">
                      <p className="text-sm text-gray-600">Target Alto</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${fundamentalData.price_target_high?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <p className="text-sm text-gray-600">Target Medio</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${fundamentalData.price_target_median?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded">
                      <p className="text-sm text-gray-600">Target Basso</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${fundamentalData.price_target_low?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded">
                      <p className="text-sm text-gray-600">Upside Potenziale</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {((fundamentalData.price_target_median - fundamentalData.close) / fundamentalData.close * 100)?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Previsioni */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📅 Previsioni Prossimo Trimestre</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Forecast</span>
                      <span className="font-semibold">
                        ${(fundamentalData.revenue_forecast_fq / 1e9)?.toFixed(2)}B
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EPS Forecast</span>
                      <span className="font-semibold">
                        ${fundamentalData.earnings_per_share_forecast_fq?.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Altri Indicatori</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capex per Share (TTM)</span>
                      <span className="font-semibold">
                        ${fundamentalData.capex_per_share_ttm?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inventory Turnover</span>
                      <span className="font-semibold">
                        {fundamentalData.invent_turnover_current?.toFixed(2)}x
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </TabsContent>

            {/* TAB 2: TECNICI */}
            <TabsContent value="tecnici" className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Oscillatori */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Oscillatori</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">RSI (14)</span>
                        <span className="font-bold text-lg">{fundamentalData.RSI?.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            fundamentalData.RSI > 70 ? 'bg-red-500' :
                            fundamentalData.RSI < 30 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{width: `${fundamentalData.RSI}%`}}
                        />
                      </div>
                      <Badge variant={
                        fundamentalData.RSI > 70 ? 'destructive' :
                        fundamentalData.RSI < 30 ? 'default' : 'secondary'
                      } className="mt-2">
                        {fundamentalData.RSI > 70 ? 'Ipercomprato' :
                        fundamentalData.RSI < 30 ? 'Ipervenduto' : 'Neutrale'}
                      </Badge>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">MACD</span>
                        <span className="font-bold">{fundamentalData['MACD.macd']?.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Signal</span>
                        <span className="font-bold">{fundamentalData['MACD.signal']?.toFixed(4)}</span>
                      </div>
                      <Badge variant={
                        fundamentalData['MACD.macd'] > fundamentalData['MACD.signal'] 
                          ? 'default' 
                          : 'secondary'
                      } className="mt-2">
                        {fundamentalData['MACD.macd'] > fundamentalData['MACD.signal'] 
                          ? 'Bullish' 
                          : 'Bearish'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Medie Mobili */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📈 Medie Mobili</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">SMA 50</span>
                      <div className="text-right">
                        <p className="font-bold">${fundamentalData.SMA50?.toFixed(2)}</p>
                        <Badge variant={fundamentalData.close > fundamentalData.SMA50 ? 'default' : 'secondary'} className="text-xs">
                          {fundamentalData.close > fundamentalData.SMA50 ? 'Sopra' : 'Sotto'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">SMA 200</span>
                      <div className="text-right">
                        <p className="font-bold">${fundamentalData.SMA200?.toFixed(2)}</p>
                        <Badge variant={fundamentalData.close > fundamentalData.SMA200 ? 'default' : 'secondary'} className="text-xs">
                          {fundamentalData.close > fundamentalData.SMA200 ? 'Sopra' : 'Sotto'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trend</span>
                      <Badge variant={
                        fundamentalData.SMA50 > fundamentalData.SMA200 ? 'default' : 'destructive'
                      }>
                        {fundamentalData.SMA50 > fundamentalData.SMA200 ? 'Golden Cross' : 'Death Cross'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Volatilità & Rating */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">⚡ Volatilità & Rating</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Volatilità Giornaliera</span>
                      <span className="font-bold">{fundamentalData['Volatility.D']?.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Beta (1Y)</span>
                      <span className="font-bold">{fundamentalData.beta_1_year?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-600">Beta (2Y)</span>
                      <span className="font-bold">{fundamentalData.beta_2_year?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rating Tecnico</span>
                      <Badge className={
                        fundamentalData['Recommend.All'] > 0.5 ? 'bg-green-500' :
                        fundamentalData['Recommend.All'] > 0 ? 'bg-blue-500' :
                        fundamentalData['Recommend.All'] > -0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }>
                        {fundamentalData['Recommend.All'] > 0.5 ? 'Strong Buy' :
                        fundamentalData['Recommend.All'] > 0.1 ? 'Buy' :
                        fundamentalData['Recommend.All'] > -0.1 ? 'Neutral' :
                        fundamentalData['Recommend.All'] > -0.5 ? 'Sell' : 'Strong Sell'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Volume & Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume Attuale</span>
                      <span className="font-semibold">
                        {(fundamentalData.volume / 1e6)?.toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume Relativo (10D)</span>
                      <span className="font-semibold">
                        {fundamentalData.relative_volume_10d_calc?.toFixed(2)}x
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📈 Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Change %</span>
                      <Badge variant={fundamentalData.change > 0 ? 'default' : 'destructive'}>
                        {fundamentalData.change?.toFixed(2)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </TabsContent>

            {/* TAB 3: CRESCITA */}
            <TabsContent value="crescita" className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Crescita YoY */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Crescita Year-over-Year</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">Revenue Growth (YoY)</span>
                      <Badge variant={
                        fundamentalData.total_revenue_yoy_growth_fy > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.total_revenue_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">Gross Profit Growth</span>
                      <Badge variant={
                        fundamentalData.gross_profit_yoy_growth_fy > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.gross_profit_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">Net Income Growth</span>
                      <Badge variant={
                        fundamentalData.net_income_yoy_growth_fy > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.net_income_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">EPS Growth (YoY)</span>
                      <Badge variant={
                        fundamentalData.earnings_per_share_diluted_yoy_growth_fy > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.earnings_per_share_diluted_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">EBITDA Growth</span>
                      <Badge variant={
                        fundamentalData.ebitda_yoy_growth_fy > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.ebitda_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Free Cash Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💰 Free Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">FCF Growth (YoY)</span>
                      <Badge variant={
                        fundamentalData.free_cash_flow_yoy_growth_fy > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.free_cash_flow_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-gray-600">FCF CAGR (5Y)</span>
                      <Badge variant={
                        fundamentalData.free_cash_flow_cagr_5y > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.free_cash_flow_cagr_5y * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Capex Growth (YoY)</span>
                      <Badge variant={
                        fundamentalData.capital_expenditures_yoy_growth_ttm > 0 ? 'default' : 'destructive'
                      }>
                        {(fundamentalData.capital_expenditures_yoy_growth_ttm * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </TabsContent>
          {/* TAB 2: TECNICI */}
            <TabsContent value="tecnici" className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* RSI */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">RSI (14)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold mb-2">
                        {fundamentalData.RSI?.toFixed(1)}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className={`h-4 rounded-full transition-all ${
                            fundamentalData.RSI > 70 ? 'bg-red-500' :
                            fundamentalData.RSI < 30 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{width: `${Math.min(fundamentalData.RSI, 100)}%`}}
                        />
                      </div>
                      <Badge variant={
                        fundamentalData.RSI > 70 ? 'destructive' :
                        fundamentalData.RSI < 30 ? 'default' : 'secondary'
                      }>
                        {fundamentalData.RSI > 70 ? '🔴 Ipercomprato' :
                        fundamentalData.RSI < 30 ? '🟢 Ipervenduto' : '🟡 Neutrale'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* MACD */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">MACD</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">MACD Line:</span>
                      <span className="font-bold">{fundamentalData['MACD.macd']?.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Signal:</span>
                      <span className="font-bold">{fundamentalData['MACD.signal']?.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Histogram:</span>
                      <span className={`font-bold ${
                        (fundamentalData['MACD.macd'] - fundamentalData['MACD.signal']) > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(fundamentalData['MACD.macd'] - fundamentalData['MACD.signal'])?.toFixed(4)}
                      </span>
                    </div>
                    <Badge variant={
                      fundamentalData['MACD.macd'] > fundamentalData['MACD.signal'] 
                        ? 'default' 
                        : 'destructive'
                    } className="w-full justify-center">
                      {fundamentalData['MACD.macd'] > fundamentalData['MACD.signal'] 
                        ? '🟢 Bullish Cross' 
                        : '🔴 Bearish Cross'}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Stochastic RSI */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stoch RSI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">K:</span>
                        <span className="font-bold">
                          {fundamentalData['Stoch.RSI.K']?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">D:</span>
                        <span className="font-bold">
                          {fundamentalData['Stoch.RSI.D']?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      <Badge variant={
                        (fundamentalData['Stoch.RSI.K'] || 0) > 80 ? 'destructive' :
                        (fundamentalData['Stoch.RSI.K'] || 0) < 20 ? 'default' : 'secondary'
                      } className="w-full justify-center">
                        {(fundamentalData['Stoch.RSI.K'] || 0) > 80 ? 'Ipercomprato' :
                        (fundamentalData['Stoch.RSI.K'] || 0) < 20 ? 'Ipervenduto' : 'Neutrale'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* CCI */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CCI (20)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold mb-2">
                        {fundamentalData.CCI20?.toFixed(1) || 'N/A'}
                      </p>
                      <Badge variant={
                        (fundamentalData.CCI20 || 0) > 100 ? 'destructive' :
                        (fundamentalData.CCI20 || 0) < -100 ? 'default' : 'secondary'
                      }>
                        {(fundamentalData.CCI20 || 0) > 100 ? '🔴 Ipercomprato' :
                        (fundamentalData.CCI20 || 0) < -100 ? '🟢 Ipervenduto' : '🟡 Neutrale'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Medie Mobili Dettagliate */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Medie Mobili & Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-600">Simple Moving Averages (SMA)</h4>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">SMA 10</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.SMA10?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.SMA10 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.SMA10 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">SMA 20</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.SMA20?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.SMA20 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.SMA20 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">SMA 50</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.SMA50?.toFixed(2)}</p>
                          <Badge variant={fundamentalData.close > fundamentalData.SMA50 ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > fundamentalData.SMA50 ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">SMA 100</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.SMA100?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.SMA100 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.SMA100 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">SMA 200</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.SMA200?.toFixed(2)}</p>
                          <Badge variant={fundamentalData.close > fundamentalData.SMA200 ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > fundamentalData.SMA200 ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-600">Exponential Moving Averages (EMA)</h4>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">EMA 10</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.EMA10?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.EMA10 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.EMA10 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">EMA 20</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.EMA20?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.EMA20 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.EMA20 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">EMA 50</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.EMA50?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.EMA50 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.EMA50 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">EMA 100</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.EMA100?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.EMA100 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.EMA100 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">EMA 200</span>
                        <div className="text-right">
                          <p className="font-bold">${fundamentalData.EMA200?.toFixed(2) || 'N/A'}</p>
                          <Badge variant={fundamentalData.close > (fundamentalData.EMA200 || 0) ? 'default' : 'secondary'} className="text-xs">
                            {fundamentalData.close > (fundamentalData.EMA200 || 0) ? 'Sopra ↑' : 'Sotto ↓'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Trend Analysis */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">🎯 Analisi Trend</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Badge variant={
                        fundamentalData.close > fundamentalData.SMA50 && 
                        fundamentalData.SMA50 > fundamentalData.SMA200 
                          ? 'default' : 'secondary'
                      } className="justify-center">
                        {fundamentalData.SMA50 > fundamentalData.SMA200 ? '🟢 Golden Cross' : '🔴 Death Cross'}
                      </Badge>
                      <Badge variant={
                        fundamentalData.close > fundamentalData.SMA20 ? 'default' : 'secondary'
                      } className="justify-center">
                        {fundamentalData.close > fundamentalData.SMA20 ? 'Trend Rialzista ST' : 'Trend Ribassista ST'}
                      </Badge>
                      <Badge variant={
                        fundamentalData.close > fundamentalData.SMA50 ? 'default' : 'secondary'
                      } className="justify-center">
                        {fundamentalData.close > fundamentalData.SMA50 ? 'Trend Rialzista MT' : 'Trend Ribassista MT'}
                      </Badge>
                      <Badge variant={
                        fundamentalData.close > fundamentalData.SMA200 ? 'default' : 'secondary'
                      } className="justify-center">
                        {fundamentalData.close > fundamentalData.SMA200 ? 'Trend Rialzista LT' : 'Trend Ribassista LT'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bollinger Bands & ATR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📉 Bollinger Bands</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Upper Band:</span>
                      <span className="font-bold">${fundamentalData['BB.upper']?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Middle (SMA 20):</span>
                      <span className="font-bold">${fundamentalData['BB.middle']?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lower Band:</span>
                      <span className="font-bold">${fundamentalData['BB.lower']?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bandwidth:</span>
                      <span className="font-bold">
                        {((fundamentalData['BB.upper'] - fundamentalData['BB.lower']) / fundamentalData['BB.middle'] * 100)?.toFixed(2)}%
                      </span>
                    </div>
                    <Badge variant={
                      fundamentalData.close > (fundamentalData['BB.upper'] || Infinity) ? 'destructive' :
                      fundamentalData.close < (fundamentalData['BB.lower'] || 0) ? 'default' : 'secondary'
                    } className="w-full justify-center">
                      {fundamentalData.close > (fundamentalData['BB.upper'] || Infinity) ? '🔴 Sopra Upper' :
                      fundamentalData.close < (fundamentalData['BB.lower'] || 0) ? '🟢 Sotto Lower' : '🟡 Dentro Bande'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">⚡ Volatilità & ATR</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ATR (14):</span>
                      <span className="font-bold">{fundamentalData.ATR?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volatilità Giornaliera:</span>
                      <span className="font-bold">{fundamentalData['Volatility.D']?.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volatilità Settimanale:</span>
                      <span className="font-bold">{fundamentalData['Volatility.W']?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volatilità Mensile:</span>
                      <span className="font-bold">{fundamentalData['Volatility.M']?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <Badge variant={
                      fundamentalData['Volatility.D'] > 3 ? 'destructive' :
                      fundamentalData['Volatility.D'] > 1.5 ? 'secondary' : 'default'
                    } className="w-full justify-center">
                      {fundamentalData['Volatility.D'] > 3 ? '🔴 Alta Volatilità' :
                      fundamentalData['Volatility.D'] > 1.5 ? '🟡 Media Volatilità' : '🟢 Bassa Volatilità'}
                    </Badge>
                  </CardContent>
                </Card>

              </div>

              {/* ADX & Momentum */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💪 ADX (Trend Strength)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold">{fundamentalData.ADX?.toFixed(1) || 'N/A'}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>+DI:</span>
                          <span className="font-bold text-green-600">
                            {fundamentalData['ADX+DI']?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>-DI:</span>
                          <span className="font-bold text-red-600">
                            {fundamentalData['ADX-DI']?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={
                        (fundamentalData.ADX || 0) > 25 ? 'default' : 'secondary'
                      }>
                        {(fundamentalData.ADX || 0) > 25 ? '💪 Trend Forte' : '😴 Trend Debole'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Momentum Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Momentum (10):</span>
                      <span className="font-bold">{fundamentalData.Mom?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ROC (Rate of Change):</span>
                      <span className="font-bold">{fundamentalData.ROC?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Williams %R:</span>
                      <span className="font-bold">{fundamentalData['W.R']?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🎯 Rating Tecnico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-3">
                      <p className="text-3xl font-bold">
                        {fundamentalData['Recommend.All']?.toFixed(2)}
                      </p>
                      <Badge className={`text-lg px-4 py-2 ${
                        fundamentalData['Recommend.All'] > 0.5 ? 'bg-green-600' :
                        fundamentalData['Recommend.All'] > 0.1 ? 'bg-blue-500' :
                        fundamentalData['Recommend.All'] > -0.1 ? 'bg-yellow-500' :
                        fundamentalData['Recommend.All'] > -0.5 ? 'bg-orange-500' : 'bg-red-600'
                      }`}>
                        {fundamentalData['Recommend.All'] > 0.5 ? '🟢 Strong Buy' :
                        fundamentalData['Recommend.All'] > 0.1 ? '🔵 Buy' :
                        fundamentalData['Recommend.All'] > -0.1 ? '🟡 Neutral' :
                        fundamentalData['Recommend.All'] > -0.5 ? '🟠 Sell' : '🔴 Strong Sell'}
                      </Badge>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Oscillatori: {fundamentalData['Recommend.Other']?.toFixed(2)}</p>
                        <p>Medie Mobili: {fundamentalData['Recommend.MA']?.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Volume Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Analisi Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Volume Attuale</p>
                      <p className="text-2xl font-bold">{(fundamentalData.volume / 1e6)?.toFixed(2)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Volume Relativo (10D)</p>
                      <p className="text-2xl font-bold">{fundamentalData.relative_volume_10d_calc?.toFixed(2)}x</p>
                      <Badge variant={
                        fundamentalData.relative_volume_10d_calc > 1.5 ? 'default' : 'secondary'
                      }>
                        {fundamentalData.relative_volume_10d_calc > 1.5 ? 'Volume Alto' : 'Volume Normale'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Change %</p>
                      <p className={`text-2xl font-bold ${
                        fundamentalData.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {fundamentalData.change > 0 ? '+' : ''}{fundamentalData.change?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>

          </Tabs>
        </div>
      )}
    </div>
  )
}

