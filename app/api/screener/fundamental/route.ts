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

    const pythonUrl = process.env.PYTHON_SERVICE_URL
    
    if (!pythonUrl) {
      throw new Error('PYTHON_SERVICE_URL not configured')
    }

    console.log(`🔍 Analyzing ${ticker} via Railway`)

    // Chiama Railway Python API
    const response = await fetch(`${pythonUrl}/api/fundamental`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
      signal: AbortSignal.timeout(15000) // 15s timeout
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Python API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log(`✅ Data retrieved for ${ticker}`)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        error: error.message,
        message: 'Impossibile recuperare dati. Verifica il ticker e riprova.'
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Fundamental API - Use POST with ticker parameter',
    example: { ticker: 'NASDAQ:AAPL' }
  })
}
