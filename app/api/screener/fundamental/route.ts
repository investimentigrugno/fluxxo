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
      console.error('PYTHON_SERVICE_URL not configured')
      return NextResponse.json(
        { error: 'Servizio non configurato' },
        { status: 500 }
      )
    }

    console.log(`🔍 Analyzing ${ticker} via ${pythonUrl}/api/fundamental`)

    // Chiama Railway Python API
    const response = await fetch(`${pythonUrl}/api/fundamental`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ ticker }),
      signal: AbortSignal.timeout(30000) // 30s timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Python API error ${response.status}:`, errorText)
      
      return NextResponse.json(
        { 
          error: `Errore API: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('Python API returned error:', data.error)
      return NextResponse.json(
        { error: data.error },
        { status: 404 }
      )
    }
    
    console.log(`✅ Data retrieved for ${ticker}`)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message)
    
    return NextResponse.json(
      { 
        error: 'Errore nel caricamento dati',
        message: error.message,
        details: 'Verifica che Railway Python service sia attivo'
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  const pythonUrl = process.env.PYTHON_SERVICE_URL
  
  return NextResponse.json({ 
    message: 'Fundamental Analysis API',
    status: pythonUrl ? 'configured' : 'not configured',
    pythonServiceUrl: pythonUrl ? 'connected' : 'missing PYTHON_SERVICE_URL env var',
    usage: 'POST with { ticker: "NASDAQ:AAPL" }'
  })
}
