import { NextRequest, NextResponse } from 'next/server'
import { calculateInvestmentScore, formatTechnicalRating } from '@/lib/scoringAlgorithm'

export async function POST(request: NextRequest) {
  try {
    const { filterType } = await request.json()

    // Genera 100 stock mock con scoring
    const stocks = []
    const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC']
    
    for (let i = 0; i < 100; i++) {
      const ticker = tickers[i % tickers.length] + (i > 9 ? i : '')
      
      const stockData = {
        name: ticker,
        market: ['NASDAQ', 'NYSE'][Math.floor(Math.random() * 2)],
        close: Math.random() * 500 + 50,
        volume: Math.floor(Math.random() * 10000000),
        market_cap_basic: Math.floor(Math.random() * 100e9) + 1e9,
        RSI: Math.random() * 50 + 30,
        'MACD.macd': (Math.random() - 0.5) * 2,
        'MACD.signal': (Math.random() - 0.5) * 2,
        SMA50: Math.random() * 500 + 50,
        SMA200: Math.random() * 500 + 50,
        'Volatility.D': Math.random() * 3,
        'Recommend.All': (Math.random() - 0.3) * 1.5,
        change: (Math.random() - 0.5) * 10,
        price_earnings_ttm: Math.random() * 40 + 5,
        return_on_equity: Math.random() * 0.4,
        debt_to_equity: Math.random() * 2,
        dividend_yield_recent: Math.random() * 0.05
      }

      const scored = calculateInvestmentScore(stockData)
      scored.TechnicalRating = formatTechnicalRating(scored['Recommend.All'])
      
      stocks.push(scored)
    }

    // Applica filtri
    let filtered = stocks

    switch (filterType) {
      case 'top_score':
        filtered = stocks.filter(s => s.InvestmentScore > 70)
        break
      case 'value':
        filtered = stocks.filter(s => s.price_earnings_ttm < 20 && s.return_on_equity > 0.15)
        break
      case 'growth':
        filtered = stocks.filter(s => s.change > 2 && s.RSI < 70)
        break
      case 'dividend':
        filtered = stocks.filter(s => s.dividend_yield_recent > 0.02)
        break
      case 'momentum':
        filtered = stocks.filter(s => s.RSI > 50 && s['Recommend.All'] > 0.3)
        break
    }

    // Ordina per score
    filtered.sort((a, b) => b.InvestmentScore - a.InvestmentScore)

    return NextResponse.json({ stocks: filtered })

  } catch (error: any) {
    console.error('Errore multi-scan:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
