'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AuthWrapper from '@/components/ui/AuthWrapper'

export default function PortfolioPage() {
  const supabase = createClientComponentClient()
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [prices, setPrices] = useState<Record<string, { price: number; currency: string }>>({})
  const [loading, setLoading] = useState(true)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [totals, setTotals] = useState({ value: 0, pnl: 0, pnlPercent: 0 })

  useEffect(() => {
    loadPortfolio()
  }, [])

  async function fetchPrices(instruments: string[]) {
  // ✅ FILTRI MENO RESTRITTIVI - prova TUTTI tranne i 3 speciali
  const validInstruments = instruments.filter(instrument => 
    !['BONDORA', 'BONDORA_CASH', 'BOT.FX'].includes(instrument)
  )
  
  console.log('📊 ALL instruments:', instruments)
  console.log('📊 Valid instruments for yfinance:', validInstruments)
  
  if (validInstruments.length === 0) {
    setLoadingPrices(false)
    return
  }

  setLoadingPrices(true)
  const priceData: Record<string, any> = {}
  
  // ✅ PROVA TUTTI i ticker validi (anche se alcuni falliscono)
  for (const instrument of validInstruments) {
    try {
      const res = await fetch('/api/ticker/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: instrument })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.error) {
          console.warn(`⚠️ ${instrument}:`, data.error)
        } else {
          console.log(`✅ ${instrument}: ${data.price} ${data.currency}`)
          priceData[instrument] = {
            price: data.price,
            currency: data.currency,
            name: data.name,
            sector: data.sector
          }
        }
      } else {
        console.warn(`⚠️ HTTP ${res.status} ${instrument}`)
      }
    } catch (error) {
      console.warn(`❌ Fetch fallito ${instrument}:`, error)
    }
  }
  
  console.log('💰 Prezzi caricati:', Object.keys(priceData))
  setPrices(priceData)
  setLoadingPrices(false)
}


  async function loadPortfolio() {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Errore:', error)
      alert('Errore caricamento portfolio')
      setPortfolio([])
      setLoading(false)
      return
    }

    const specialInstruments = ['BONDORA', 'BONDORA_CASH', 'BOT.FX']
    const grouped = {} as any

    (data ?? []).forEach((tx: any) => {
      const key = tx.instrument
      const isSpecial = specialInstruments.includes(key)

      if (!grouped[key]) {
        grouped[key] = {
          instrument: key,
          currency: tx.currency || 'EUR',
          currentQuantity: 0,
          avgCost: 0,
          totalValue: 0,
          remainingLots: [],
          transactions: [],
          sumBuy: 0,
          sumSell: 0
        }
      }

      grouped[key].transactions.push(tx)

      if (isSpecial) {
        grouped[key].sumBuy += (tx.type === 'Buy' ? parseFloat(tx.unit_price || '0') : 0)
        grouped[key].sumSell += (tx.type === 'Sell' ? parseFloat(tx.unit_price || '0') : 0)
      } else {
        const quantity = parseFloat(tx.quantity || '0')
        const unitPrice = parseFloat(tx.unit_price || '0')
        
        if (tx.type === 'Buy') {
          grouped[key].remainingLots.push({ quantity, unitPrice })
        } else if (tx.type === 'Sell' && quantity > 0) {
          let qtyToSell = quantity
          while (qtyToSell > 0 && grouped[key].remainingLots.length > 0) {
            const lot = grouped[key].remainingLots[0]
            if (lot.quantity <= qtyToSell) {
              qtyToSell -= lot.quantity
              grouped[key].remainingLots.shift()
            } else {
              lot.quantity -= qtyToSell
              qtyToSell = 0
            }
          }
        }
      }
    })

    // Calcola quantità, costo medio, valore per special e normali
    Object.values(grouped).forEach((pos: any) => {
      if (specialInstruments.includes(pos.instrument)) {
        const netCost = pos.sumBuy - pos.sumSell
        pos.currentQuantity = netCost > 0 ? 1 : 0
        pos.avgCost = Math.abs(netCost)
        pos.totalValue = pos.currentQuantity * pos.avgCost
      } else {
        pos.currentQuantity = pos.remainingLots.reduce((sum: number, lot: any) => sum + lot.quantity, 0)
        if (pos.currentQuantity > 0) {
          const totalCost = pos.remainingLots.reduce((sum: number, lot: any) => sum + (lot.quantity * lot.unitPrice), 0)
          pos.avgCost = totalCost / pos.currentQuantity
          pos.totalValue = pos.currentQuantity * pos.avgCost
        } else {
          pos.avgCost = 0
          pos.totalValue = 0
        }
      }
    })

    const portfolio = Object.values(grouped).filter((p: any) => (p.currentQuantity || 0) > 0.00000001) as any[]
    setPortfolio(portfolio)

    // Fetch prezzi correnti
    const instruments = portfolio.map((p: any) => p.instrument)
    if (instruments.length > 0) {
      fetchPrices(instruments)
    }

    // Totali basati su costo medio (prima dei prezzi correnti)
    const totalValue = portfolio.reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0)
    const totalCost = portfolio.reduce((sum: number, p: any) => sum + ((p.currentQuantity || 0) * (p.avgCost || 0)), 0)

    setTotals({
      value: totalValue,
      pnl: totalValue - totalCost,
      pnlPercent: totalCost !== 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    })

    setLoading(false)
  }

  // Aggiorna totali quando arrivano i prezzi correnti
  useEffect(() => {
    if (Object.keys(prices).length > 0 && portfolio.length > 0) {
      const totalValueCurrent = portfolio.reduce((sum: number, p: any) => {
        const priceData = prices[p.instrument]
        const currentPrice = priceData?.price || p.avgCost || 0
        return sum + ((p.currentQuantity || 0) * currentPrice)
      }, 0)
      
      const totalCost = portfolio.reduce((sum: number, p: any) => 
        sum + ((p.currentQuantity || 0) * (p.avgCost || 0)), 0
      )

      setTotals({
        value: totalValueCurrent,
        pnl: totalValueCurrent - totalCost,
        pnlPercent: totalCost !== 0 ? ((totalValueCurrent - totalCost) / totalCost) * 100 : 0
      })
    }
  }, [prices, portfolio])

  return (
    <AuthWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📊 Portafoglio</h1>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Valore Totale</p>
              <p className="text-2xl font-bold">€ {totals.value.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">P&L</p>
              <p className={`text-2xl font-bold ${totals.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                € {totals.pnl.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">P&L %</p>
              <p className={`text-2xl font-bold ${totals.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totals.pnlPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Posizioni Aperte {loadingPrices && '(Prezzi in caricamento...)'}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500">Caricamento...</p>
            ) : portfolio.length === 0 ? (
              <p className="text-center text-gray-500">Nessuna posizione aperta</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Nome</TableHead> {/* ✅ NUOVA COLONNA */}
                      <TableHead>Qty</TableHead>
                      <TableHead>PMC</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>P&L %</TableHead>
                      <TableHead>Total Value €</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {portfolio.map((pos: any) => {
                        const qty = Number(pos.currentQuantity) || 0
                        const avgCost = Number(pos.avgCost) || 0
                        const priceData = prices[pos.instrument] as any // ✅ FIX TypeScript
                        const currentPrice = priceData?.price || avgCost
                        const currentCurrency = priceData?.currency || pos.currency || 'EUR'
                        const instrumentName = priceData?.name || pos.instrument
                        // Rimuovi sector se non serve la colonna
                        
                        const totalCostValue = qty * avgCost
                        const totalValueCurrent = qty * currentPrice
                        const pnl = totalValueCurrent - totalCostValue
                        const pnlPercent = totalCostValue !== 0 ? (pnl / totalCostValue) * 100 : 0

                        return (
                          <TableRow key={pos.instrument}>
                            <TableCell className="font-bold">{pos.instrument}</TableCell>
                            <TableCell title={instrumentName}>
                              {instrumentName.length > 25 ? `${instrumentName.substring(0, 25)}...` : instrumentName}
                            </TableCell>
                            <TableCell>{qty.toFixed(4)}</TableCell>
                            <TableCell>€ {avgCost.toFixed(2)}</TableCell>
                            <TableCell>
                              {priceData ? (
                                `${currentPrice.toFixed(2)} ${currentCurrency}`
                              ) : (
                                <span className="text-gray-400 italic">N/D</span>
                              )}
                            </TableCell>
                            <TableCell>{currentCurrency}</TableCell>
                            <TableCell className={pnl >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              € {pnl.toFixed(2)}
                            </TableCell>
                            <TableCell className={pnlPercent >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {pnlPercent.toFixed(2)}%
                            </TableCell>
                            <TableCell>€ {totalValueCurrent.toFixed(2)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  )
}
