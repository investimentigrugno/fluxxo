import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request: NextRequest) {
  const { ticker, data } = await request.json()

  const prompt = `Sei un esperto analista finanziario. Analizza i dati per ${ticker}:
${JSON.stringify(data, null, 2)}

Fornisci un'analisi breve e professionale in italiano.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      max_tokens: 1000
    })

    const analysis = completion.choices?.message?.content || 'Analisi non disponibile'

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Errore Groq:', error)
    return NextResponse.json({ error: 'Errore analisi AI' }, { status: 500 })
  }
}
