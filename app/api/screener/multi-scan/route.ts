import { NextRequest, NextResponse } from 'next/server'
import { calculateInvestmentScore, formatTechnicalRating, type ScoredStock } from '@/lib/scoringAlgorithm'

export async function POST(request: NextRequest) {
  try {
    const pythonUrl = process.env.PYTHON_SERVICE_URL
    
    if (!pythonUrl) {
      throw new Error('PYTHON_SERVICE_URL not configured')
    }

    console.log(`🔍 Calling Python service: ${pythonUrl}/api/scan`)
    
    // Chiama Railway Python API (NESSUN FILTRO)
    const response = await fetch(`${pythonUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Corpo vuoto
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      throw new Error(`Python API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log(`✅ Received ${data.count} stocks`)
    
    // Applica scoring algorithm
    const scoredStocks: ScoredStock[] = data.stocks.map((stock: any) => {
      const scored = calculateInvestmentScore(stock)
      scored.TechnicalRating = formatTechnicalRating(scored['Recommend.All'])
      return scored
    })

    // Ordina per Investment Score
    scoredStocks.sort((a: ScoredStock, b: ScoredStock) => 
      b.InvestmentScore - a.InvestmentScore
    )

    return NextResponse.json({ 
      stocks: scoredStocks,
      count: scoredStocks.length,
      source: 'TradingView via Railway'
    })

  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({ 
      error: error.message,
      stocks: []
    }, { status: 500 })
  }
}
