'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AuthWrapper from '@/components/ui/AuthWrapper'

export default function PortfolioPage() {
  const supabase = createClientComponentClient()
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ value: 0, pnl: 0, pnlPercent: 0 })

  useEffect(() => {
    loadPortfolio()
  }, [])

  async function loadPortfolio() {
  setLoading(true)
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true }) // ✅ FIFO: ordina per data crescente

  if (error) {
    console.error('Errore:', error)
    alert('Errore caricamento portfolio')
    setPortfolio([])
  } else {
    const grouped: any = {}
    const specialInstruments = ['BONDORA', 'BONDORA_CASH', 'BOT.FX']
    
    ;(data ?? []).forEach((tx: any) => {
      const key = tx.instrument
      const isSpecial = specialInstruments.includes(tx.instrument)
      
      if (!grouped[key]) {
        grouped[key] = {
          instrument: tx.instrument,
          currency: tx.currency,
          currentQuantity: 0,
          avgCost: 0,
          totalValue: 0,
          remainingLots: [], // ✅ FIFO: lista dei lotti acquistati
          transactions: []
        }
      }
      
      grouped[key].transactions.push(tx)
      
      if (isSpecial) {
        // Strumenti speciali: semplice differenza unit_price
        if (tx.type === 'Buy') {
          grouped[key].currentQuantity += parseFloat(tx.unit_price || 0)
        } else if (tx.type === 'Sell') {
          grouped[key].currentQuantity -= parseFloat(tx.unit_price || 0)
        }
        grouped[key].avgCost = grouped[key].currentQuantity > 0 ? parseFloat(tx.unit_price || 0) : 0
      } else {
        // ✅ LOGICA FIFO per strumenti normali
        if (tx.type === 'Buy') {
          // Aggiungi nuovo lotto acquistato
          grouped[key].remainingLots.push({
            quantity: parseFloat(tx.quantity),
            unitPrice: parseFloat(tx.unit_price),
            date: tx.date
          })
        } else if (tx.type === 'Sell' && grouped[key].remainingLots.length > 0) {
          // Vendi usando i lotti più vecchi (FIFO)
          const sellQuantity = parseFloat(tx.quantity)
          let remainingSell = sellQuantity
          
          while (remainingSell > 0 && grouped[key].remainingLots.length > 0) {
            const oldestLot = grouped[key].remainingLots[0]
            if (oldestLot.quantity <= remainingSell) {
              // Usa tutto il lotto
              remainingSell -= oldestLot.quantity
              grouped[key].remainingLots.shift()
            } else {
              // Usa parzialmente il lotto
              oldestLot.quantity -= remainingSell
              remainingSell = 0
            }
          }
        }
        
        // Calcola quantità attuale e costo medio dai lotti rimanenti
        grouped[key].currentQuantity = grouped[key].remainingLots.reduce((sum: number, lot: any) => sum + lot.quantity, 0)
        
        if (grouped[key].currentQuantity > 0) {
          const totalCost = grouped[key].remainingLots.reduce((sum: number, lot: any) => sum + (lot.quantity * lot.unitPrice), 0)
          grouped[key].avgCost = totalCost / grouped[key].currentQuantity
          grouped[key].totalValue = grouped[key].currentQuantity * grouped[key].avgCost
        }
      }
    })

    // ✅ FILTRO: mostra solo posizioni con quantità > 0
    const portfolio = Object.values(grouped).filter((p: any) => p.currentQuantity > 0.00000001)
    setPortfolio(portfolio as any[])

    // Calcolo totali
    const totalValue = portfolio.reduce((sum: number, p: any) => sum + p.totalValue, 0)
    const totalCost = portfolio.reduce((sum: number, p: any) => sum + (p.currentQuantity * p.avgCost), 0)
    
    setTotals({
      value: totalValue,
      pnl: totalValue - totalCost,
      pnlPercent: totalCost !== 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    })
  }
  setLoading(false)
}



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
            <CardTitle>Posizioni Aperte</CardTitle>
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
                      <TableHead>Strumento</TableHead>
                      <TableHead>Quantità</TableHead>
                      <TableHead>Costo Medio</TableHead>
                      <TableHead>Valore Totale</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>P&L %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.map((pos: any) => {
                      const qty = parseFloat(pos.currentQuantity ?? 0)
                      const avgCost = parseFloat(pos.avgCost ?? 0)
                      const totalValue = parseFloat(pos.totalValue ?? 0)
                      const pnl = totalValue - (qty * avgCost)
                      const pnlPercent = (qty * avgCost) !== 0 ? (pnl / (qty * avgCost)) * 100 : 0

                      return (
                        <TableRow key={pos.instrument}>
                          <TableCell className="font-bold">{pos.instrument}</TableCell>
                          <TableCell>{qty.toFixed(4)}</TableCell>
                          <TableCell>€ {avgCost.toFixed(2)}</TableCell>
                          <TableCell>€ {totalValue.toFixed(2)}</TableCell>
                          <TableCell className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            € {pnl.toFixed(2)}
                          </TableCell>
                          <TableCell className={pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {pnlPercent.toFixed(2)}%
                          </TableCell>
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
