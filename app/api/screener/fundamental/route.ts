import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ticker = body.ticker

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker richiesto' }, 
        { status: 400 }
      )
    }

    console.log('Ricerca ticker:', ticker)

    // Mock data realistici per test
    const mockData = {
      name: ticker.split(':')[1] || ticker,
      close: Math.random() * 200 + 50,
      volume: Math.floor(Math.random() * 10000000),
      market_cap_basic: Math.floor(Math.random() * 1000000000000),
      price_earnings_ttm: (Math.random() * 30 + 10).toFixed(2),
      earnings_per_share_basic_ttm: (Math.random() * 10).toFixed(2),
      revenue_per_employee: Math.floor(Math.random() * 500000),
      total_revenue: Math.floor(Math.random() * 100000000000),
      price_book_ratio: (Math.random() * 10).toFixed(2),
      return_on_equity: (Math.random() * 0.5).toFixed(2),
      return_on_assets: (Math.random() * 0.3).toFixed(2),
      debt_to_equity: (Math.random() * 2).toFixed(2),
      current_ratio: (Math.random() * 3).toFixed(2),
      quick_ratio: (Math.random() * 2).toFixed(2),
      enterprise_value_ebitda_ttm: (Math.random() * 30).toFixed(2),
      dividend_yield_recent: (Math.random() * 0.05).toFixed(4)
    }

    return NextResponse.json({ 
      fundamentalData: mockData 
    })

  } catch (error: any) {
    console.error('Errore API screener:', error)
    return NextResponse.json(
      { 
        error: 'Errore interno server',
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}

// Supporta anche GET per test
export async function GET() {
  return NextResponse.json({ 
    message: 'API Screener funzionante. Usa POST con {ticker: "AAPL"}' 
  })
}
