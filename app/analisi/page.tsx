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

  async function handleSearch() {
    if (!tickerSearch) return
    
    setLoading(true)
    setFundamentalData(null)
    
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

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Recupero dati da TradingView...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!fundamentalData && !loading && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Inserisci un ticker per iniziare l'analisi
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {fundamentalData && (
        <div className="space-y-4">
          
          {/* Header Titolo */}
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

          {/* 2 TAB: Fondamentale + Tecnica */}
          <Tabs defaultValue="fondamentale">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fondamentale">📊 Analisi Fondamentale</TabsTrigger>
              <TabsTrigger value="tecnica">📈 Analisi Tecnica</TabsTrigger>
            </TabsList>

            {/* ============================================ */}
            {/* TAB 1: ANALISI FONDAMENTALE */}
            {/* ============================================ */}
            <TabsContent value="fondamentale" className="space-y-4">
              
              {/* Valutazione & Redditività & Bilancio */}
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
                      <span className="text-sm text-gray-600">Interest Rate Debt</span>
                      <span className="font-semibold">
                        {(fundamentalData.effective_interest_rate_on_debt_fy * 100)?.toFixed(2)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Crescita YoY */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Crescita Year-over-Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Revenue Growth</p>
                      <Badge variant={fundamentalData.total_revenue_yoy_growth_fy > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.total_revenue_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Gross Profit Growth</p>
                      <Badge variant={fundamentalData.gross_profit_yoy_growth_fy > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.gross_profit_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Net Income Growth</p>
                      <Badge variant={fundamentalData.net_income_yoy_growth_fy > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.net_income_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">EPS Growth</p>
                      <Badge variant={fundamentalData.earnings_per_share_diluted_yoy_growth_fy > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.earnings_per_share_diluted_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-pink-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">EBITDA Growth</p>
                      <Badge variant={fundamentalData.ebitda_yoy_growth_fy > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.ebitda_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Price + FCF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🎯 Target Price Analisti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-green-50 rounded">
                        <p className="text-sm text-gray-600">Alto</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${fundamentalData.price_target_high?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded">
                        <p className="text-sm text-gray-600">Medio</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${fundamentalData.price_target_median?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded">
                        <p className="text-sm text-gray-600">Basso</p>
                        <p className="text-2xl font-bold text-red-600">
                          ${fundamentalData.price_target_low?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600">Upside Potenziale</p>
                      <p className="text-xl font-bold text-purple-600">
                        {((fundamentalData.price_target_median - fundamentalData.close) / fundamentalData.close * 100)?.toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💰 Free Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">FCF Growth (YoY):</span>
                      <Badge variant={fundamentalData.free_cash_flow_yoy_growth_fy > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.free_cash_flow_yoy_growth_fy * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">FCF CAGR (5Y):</span>
                      <Badge variant={fundamentalData.free_cash_flow_cagr_5y > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.free_cash_flow_cagr_5y * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capex Growth (YoY):</span>
                      <Badge variant={fundamentalData.capital_expenditures_yoy_growth_ttm > 0 ? 'default' : 'destructive'}>
                        {(fundamentalData.capital_expenditures_yoy_growth_ttm * 100)?.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </TabsContent>

            {/* ============================================ */}
            {/* TAB 2: ANALISI TECNICA */}
            {/* ============================================ */}
            <TabsContent value="tecnica" className="space-y-4">
              
              {/* Oscillatori: RSI + MACD + Stoch RSI + CCI */}
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
                          className={`h-4 rounded-full ${
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
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MACD:</span>
                      <span className="font-bold">{fundamentalData['MACD.macd']?.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Signal:</span>
                      <span className="font-bold">{fundamentalData['MACD.signal']?.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Histogram:</span>
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
                        ? 'default' : 'destructive'
                    } className="w-full justify-center">
                      {fundamentalData['MACD.macd'] > fundamentalData['MACD.signal'] 
                        ? '🟢 Bullish' : '🔴 Bearish'}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Stochastic RSI */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stoch RSI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">K:</span>
                      <span className="font-bold">
                        {fundamentalData['Stoch.RSI.K']?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">D:</span>
                      <span className="font-bold">
                        {fundamentalData['Stoch.RSI.D']?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <Badge variant={
                      (fundamentalData['Stoch.RSI.K'] || 50) > 80 ? 'destructive' :
                      (fundamentalData['Stoch.RSI.K'] || 50) < 20 ? 'default' : 'secondary'
                    } className="w-full justify-center mt-2">
                      {(fundamentalData['Stoch.RSI.K'] || 50) > 80 ? 'Ipercomprato' :
                       (fundamentalData['Stoch.RSI.K'] || 50) < 20 ? 'Ipervenduto' : 'Neutrale'}
                    </Badge>
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

              {/* Medie Mobili SMA + EMA */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Medie Mobili</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* SMA */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-3">Simple Moving Averages</h4>
                      <div className="space-y-2">
                        {[
                          { label: 'SMA 10', key: 'SMA10' },
                          { label: 'SMA 20', key: 'SMA20' },
                          { label: 'SMA 50', key: 'SMA50' },
                          { label: 'SMA 100', key: 'SMA100' },
                          { label: 'SMA 200', key: 'SMA200' }
                        ].map(({ label, key }) => (
                          <div key={key} className="flex justify-between items-center border-b pb-1">
                            <span className="text-sm">{label}</span>
                            <div className="text-right">
                              <span className="font-bold text-sm">
                                ${fundamentalData[key]?.toFixed(2) || 'N/A'}
                              </span>
                              <Badge 
                                variant={fundamentalData.close > (fundamentalData[key] || 0) ? 'default' : 'secondary'} 
                                className="ml-2 text-xs"
                              >
                                {fundamentalData.close > (fundamentalData[key] || 0) ? '↑' : '↓'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* EMA */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-3">Exponential Moving Averages</h4>
                      <div className="space-y-2">
                        {[
                          { label: 'EMA 10', key: 'EMA10' },
                          { label: 'EMA 20', key: 'EMA20' },
                          { label: 'EMA 50', key: 'EMA50' },
                          { label: 'EMA 100', key: 'EMA100' },
                          { label: 'EMA 200', key: 'EMA200' }
                        ].map(({ label, key }) => (
                          <div key={key} className="flex justify-between items-center border-b pb-1">
                            <span className="text-sm">{label}</span>
                            <div className="text-right">
                              <span className="font-bold text-sm">
                                ${fundamentalData[key]?.toFixed(2) || 'N/A'}
                              </span>
                              <Badge 
                                variant={fundamentalData.close > (fundamentalData[key] || 0) ? 'default' : 'secondary'} 
                                className="ml-2 text-xs"
                              >
                                {fundamentalData.close > (fundamentalData[key] || 0) ? '↑' : '↓'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Trend Analysis */}
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Badge variant={fundamentalData.SMA50 > fundamentalData.SMA200 ? 'default' : 'destructive'}>
                        {fundamentalData.SMA50 > fundamentalData.SMA200 ? '🟢 Golden Cross' : '🔴 Death Cross'}
                      </Badge>
                      <Badge variant={fundamentalData.close > (fundamentalData.SMA20 || 0) ? 'default' : 'secondary'}>
                        Trend ST: {fundamentalData.close > (fundamentalData.SMA20 || 0) ? 'Rialzista' : 'Ribassista'}
                      </Badge>
                      <Badge variant={fundamentalData.close > fundamentalData.SMA50 ? 'default' : 'secondary'}>
                        Trend MT: {fundamentalData.close > fundamentalData.SMA50 ? 'Rialzista' : 'Ribassista'}
                      </Badge>
                      <Badge variant={fundamentalData.close > fundamentalData.SMA200 ? 'default' : 'secondary'}>
                        Trend LT: {fundamentalData.close > fundamentalData.SMA200 ? 'Rialzista' : 'Ribassista'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bollinger Bands + Volatilità + Rating */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Bollinger Bands */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📉 Bollinger Bands</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Upper:</span>
                      <span className="font-bold">${fundamentalData['BB.upper']?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Middle:</span>
                      <span className="font-bold">${fundamentalData['BB.middle']?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lower:</span>
                      <span className="font-bold">${fundamentalData['BB.lower']?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <Badge variant={
                      fundamentalData.close > (fundamentalData['BB.upper'] || Infinity) ? 'destructive' :
                      fundamentalData.close < (fundamentalData['BB.lower'] || 0) ? 'default' : 'secondary'
                    } className="w-full justify-center mt-2">
                      {fundamentalData.close > (fundamentalData['BB.upper'] || Infinity) ? '🔴 Sopra Upper' :
                       fundamentalData.close < (fundamentalData['BB.lower'] || 0) ? '🟢 Sotto Lower' : '🟡 Dentro Bande'}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Volatilità */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">⚡ Volatilità</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ATR (14):</span>
                      <span className="font-bold">{fundamentalData.ATR?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vol. Giornaliera:</span>
                      <span className="font-bold">{fundamentalData['Volatility.D']?.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vol. Settimanale:</span>
                      <span className="font-bold">{fundamentalData['Volatility.W']?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Beta (1Y):</span>
                      <span className="font-bold">{fundamentalData.beta_1_year?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Rating Tecnico */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🎯 Rating Tecnico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <p className="text-3xl font-bold">
                        {fundamentalData['Recommend.All']?.toFixed(2)}
                      </p>
                      <Badge className={`text-base px-3 py-2 ${
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
                      <div className="text-xs text-gray-600 space-y-1 mt-2">
                        <p>Oscillatori: {fundamentalData['Recommend.Other']?.toFixed(2) || 'N/A'}</p>
                        <p>Medie Mobili: {fundamentalData['Recommend.MA']?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Volume & ADX */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume Attuale:</span>
                      <span className="font-bold">
                        {(fundamentalData.volume / 1e6)?.toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume Relativo (10D):</span>
                      <span className="font-bold">
                        {fundamentalData.relative_volume_10d_calc?.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Change %:</span>
                      <Badge variant={fundamentalData.change > 0 ? 'default' : 'destructive'}>
                        {fundamentalData.change > 0 ? '+' : ''}{fundamentalData.change?.toFixed(2)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💪 ADX (Trend Strength)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold">{fundamentalData.ADX?.toFixed(1) || 'N/A'}</p>
                      <div className="flex justify-around text-sm mt-3">
                        <div>
                          <p className="text-gray-600">+DI</p>
                          <p className="font-bold text-green-600">
                            {fundamentalData['ADX+DI']?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">-DI</p>
                          <p className="font-bold text-red-600">
                            {fundamentalData['ADX-DI']?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={(fundamentalData.ADX || 0) > 25 ? 'default' : 'secondary'}>
                        {(fundamentalData.ADX || 0) > 25 ? '💪 Trend Forte' : '😴 Trend Debole'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </TabsContent>

          </Tabs>

        </div>
      )}

    </div>
  )
}
