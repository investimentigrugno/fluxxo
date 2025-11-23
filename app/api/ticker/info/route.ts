import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json()

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker richiesto' }, { status: 400 })
    }

    const pythonUrl = process.env.PYTHON_SERVICE_URL
    
    if (!pythonUrl) {
      console.error('❌ PYTHON_SERVICE_URL non configurato')
      return NextResponse.json({ error: 'Servizio non configurato' }, { status: 500 })
    }

    console.log(`🔍 Fetching ticker info for: ${ticker}`)
    console.log(`🔗 Python URL: ${pythonUrl}`)

    const response = await fetch(`${pythonUrl}/api/ticker/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
      signal: AbortSignal.timeout(10000)
    })

    console.log(`📡 Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Python API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Python API error: ${response.status} - ${errorText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('✅ Data received:', data)
    
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Error fetching ticker info:', error.message)
    return NextResponse.json(
      { error: 'Impossibile recuperare info ticker: ' + error.message },
      { status: 500 }
    )
  }
}
