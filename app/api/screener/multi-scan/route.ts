import { NextRequest, NextResponse } from 'next/server'
import { calculateInvestmentScore, formatTechnicalRating, type ScoredStock } from '@/lib/scoringAlgorithm'

export async function POST(request: NextRequest) {
  try {
    const { filterType } = await request.json()

    // URL Python service su Railway
    const pythonUrl = process.env.PYTHON_SERVICE_URL
    
    if (!pythonUrl) {
      throw new Error('PYTHON_SERVICE_URL not configured')
    }

    console.log(`🔍 Calling Python service: ${pythonUrl}/api/scan`)
    
    // Chiama Railway Python API
    const response = await fetch(`${pythonUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filterType }),
      signal: AbortSignal.timeout(30000) // 30s timeout
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Python API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    
    console.log(`✅ Received ${data.count} stocks from Python API`)
    
    // Applica scoring algorithm ai dati REALI
    const scoredStocks: ScoredStock[] = data.stocks.map((stock: any) => {
      const scored = calculateInvestmentScore(stock)
      scored.TechnicalRating = formatTechnicalRating(scored['Recommend.All'])
      return scored
    })

    // Ordina per Investment Score
    scoredStocks.sort((a: ScoredStock, b: ScoredStock) => b.InvestmentScore - a.InvestmentScore)

    return NextResponse.json({ 
      stocks: scoredStocks,
      count: scoredStocks.length,
      source: 'TradingView Real Data via Railway'
    })

  } catch (error: any) {
    console.error('❌ Error calling Python service:', error)
    
    return NextResponse.json({ 
      error: error.message,
      stocks: [],
      source: 'Error - Python service unavailable'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Multi-scan API - Use POST with filterType',
    pythonServiceConfigured: !!process.env.PYTHON_SERVICE_URL
  })
}
