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
    .order('date', { ascending: false })

  if (error) {
    console.error('Errore:', error)
    alert('Errore caricamento portfolio')
    setPortfolio([])
  } else {
    const grouped: any = {}
    
    ;(data ?? []).forEach((tx: any) => {
      const key = tx.instrument
      if (!grouped[key]) {
        grouped[key] = {
          instrument: tx.instrument,
          currency: tx.currency,
          quantity: 0,
          totalCost: 0,
          transactions: []
        }
      }
      
      if (tx.type === 'Buy') {
        grouped[key].quantity += parseFloat(tx.quantity)
        grouped[key].totalCost += parseFloat(tx.quantity) * parseFloat(tx.unit_price)
      } else if (tx.type === 'Sell') {
        grouped[key].quantity -= parseFloat(tx.quantity)
        grouped[key].totalCost -= parseFloat(tx.quantity) * parseFloat(tx.unit_price)
      }
      grouped[key].transactions.push(tx)
    })

    // ✅ FILTRO: Solo posizioni con quantità != 0
    const portfolio = Object.values(grouped).filter((p: any) => Math.abs(p.quantity) > 0.0001)
    setPortfolio(portfolio as any[])

    const totalValue = portfolio.reduce((sum: number, p: any) => {
      const avgPrice = p.totalCost / p.quantity
      return sum + (p.quantity * avgPrice)
    }, 0)
    
    const totalCost = portfolio.reduce((sum: number, p: any) => sum + p.totalCost, 0)
    
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
                      const avgCost = pos.totalCost / pos.quantity
                      const totalValue = pos.quantity * avgCost
                      const pnl = totalValue - pos.totalCost
                      const pnlPercent = (pnl / pos.totalCost) * 100

                      return (
                        <TableRow key={pos.instrument}>
                          <TableCell className="font-bold">{pos.instrument}</TableCell>
                          <TableCell>{parseFloat(pos.quantity).toFixed(4)}</TableCell>
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
