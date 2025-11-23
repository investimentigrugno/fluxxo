import { NextRequest, NextResponse } from 'next/server'
import { calculateInvestmentScore, formatTechnicalRating } from '@/lib/scoringAlgorithm'

export async function POST(request: NextRequest) {
  try {
    const { filterType } = await request.json()

    // Chiama Python API Vercel
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/screener`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filterType })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    
    // Applica scoring algorithm ai dati reali
    const scoredStocks = data.stocks.map((stock: any) => {
      const scored = calculateInvestmentScore(stock)
      scored.TechnicalRating = formatTechnicalRating(scored['Recommend.All'])
      scored.market = stock.country || 'Unknown'
      return scored
    })

    // Ordina per Investment Score
    scoredStocks.sort((a, b) => b.InvestmentScore - a.InvestmentScore)

    return NextResponse.json({ 
      stocks: scoredStocks,
      count: scoredStocks.length,
      source: 'TradingView Real Data'
    })

  } catch (error: any) {
    console.error('Errore multi-scan:', error)
    
    // Fallback a dati mock se Python API fallisce
    return NextResponse.json({ 
      error: error.message,
      stocks: [],
      source: 'Error - Check Python API'
    }, { status: 500 })
  }
}
