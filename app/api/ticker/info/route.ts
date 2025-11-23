import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json()

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker richiesto' }, { status: 400 })
    }

    const pythonUrl = process.env.PYTHON_SERVICE_URL
    
    if (!pythonUrl) {
      return NextResponse.json({ error: 'Servizio non configurato' }, { status: 500 })
    }

    console.log(`🔍 Fetching ticker info for: ${ticker}`)

    const response = await fetch(`${pythonUrl}/api/ticker/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Python API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Error fetching ticker info:', error)
    return NextResponse.json(
      { error: 'Impossibile recuperare info ticker' },
      { status: 500 }
    )
  }
}
