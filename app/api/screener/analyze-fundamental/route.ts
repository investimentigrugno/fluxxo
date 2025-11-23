import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticker, data } = body

    if (!ticker || !data) {
      return NextResponse.json(
        { error: 'Ticker e dati richiesti' }, 
        { status: 400 }
      )
    }

    console.log('Analisi per:', ticker)

    // Analisi mock professionale
    const pe = parseFloat(data.price_earnings_ttm) || 0
    const roe = parseFloat(data.return_on_equity) || 0
    const debtEquity = parseFloat(data.debt_to_equity) || 0
    const currentRatio = parseFloat(data.current_ratio) || 0

    let valutazione = 'NEUTRA'
    let rating = '⭐⭐⭐'
    
    if (pe < 15 && roe > 0.15) {
      valutazione = 'SOTTOVALUTATA'
      rating = '⭐⭐⭐⭐⭐'
    } else if (pe > 30 || roe < 0.1) {
      valutazione = 'SOPRAVVALUTATA'
      rating = '⭐⭐'
    }

    const analysis = `📊 **Analisi Fondamentale ${ticker}**

**Rating:** ${rating} ${valutazione}

**Valutazione:**
- P/E Ratio: ${pe.toFixed(1)}x ${pe < 20 ? '✅ Ragionevole' : '⚠️ Elevato'}
- ROE: ${(roe * 100).toFixed(1)}% ${roe > 0.15 ? '✅ Ottimo' : '⚠️ Basso'}
- Debt/Equity: ${debtEquity.toFixed(2)} ${debtEquity < 1 ? '✅ Solido' : '⚠️ Alto'}
- Current Ratio: ${currentRatio.toFixed(2)} ${currentRatio > 1.5 ? '✅ Liquido' : '⚠️ Attenzione'}

**Punti di Forza:**
${roe > 0.15 ? '• Alta redditività sul capitale proprio' : ''}
${currentRatio > 1.5 ? '• Buona liquidità a breve termine' : ''}
${debtEquity < 1 ? '• Gestione prudente del debito' : ''}

**Rischi:**
${pe > 30 ? '• Valutazione elevata rispetto agli utili' : ''}
${currentRatio < 1.2 ? '• Liquidità potenzialmente sotto pressione' : ''}
${debtEquity > 1.5 ? '• Livello di indebitamento significativo' : ''}

**Raccomandazione:** ${valutazione === 'SOTTOVALUTATA' ? '🟢 BUY' : valutazione === 'SOPRAVVALUTATA' ? '🔴 HOLD/SELL' : '🟡 HOLD'}

${valutazione === 'SOTTOVALUTATA' ? 'Fondamentali solidi e valutazione attraente per accumulo graduale.' : ''}
${valutazione === 'SOPRAVVALUTATA' ? 'Valutazione elevata, attendere migliori opportunità d\'ingresso.' : ''}
${valutazione === 'NEUTRA' ? 'Fondamentali nella media, monitorare per conferme operative.' : ''}

---
*Analisi generata automaticamente - Non costituisce consulenza finanziaria*`

    return NextResponse.json({ analysis })

  } catch (error: any) {
    console.error('Errore analisi:', error)
    return NextResponse.json(
      { 
        error: 'Errore generazione analisi',
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API Analisi funzionante. Usa POST con {ticker, data}' 
  })
}
