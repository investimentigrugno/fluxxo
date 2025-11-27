'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AuthWrapper from '@/components/ui/AuthWrapper'

export default function PortfolioPage() {
  const supabase = createClientComponentClient()

  const [portfolio, setPortfolio] = useState<any[]>([])
  const [summary, setSummary] = useState({
    total_value_eur: 0,
    total_cost_basis: 0,
    total_pnl: 0,
    total_pnl_percentage: 0
  })
  const [loading, setLoading] = useState(false)

  async function loadPortfolio() {
    setLoading(true)
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .in('type', ['Buy', 'Sell'])
      .order('date', { ascending: false })

    if (error) {
      alert('Errore: ' + error.message)
      setPortfolio([])
    } else {
      // Aggregazione per strumento
      const positions: { [key: string]: any } = {}

      for (const tx of transactions || []) {
        if (!positions[tx.instrument]) {
          positions[tx.instrument] = {
            instrument: tx.instrument,
            quantity: 0,
            total_cost: 0,
            total_units_bought: 0,
            exchange_rate: tx.exchange_rate || 1,
            currency: tx.currency || 'EUR'
          }
        }

        if (tx.type === 'Buy') {
          positions[tx.instrument].quantity += tx.quantity
          positions[tx.instrument].total_cost += (tx.quantity * tx.unit_price) + (tx.commission || 0)
          positions[tx.instrument].total_units_bought += tx.quantity
        } else if (tx.type === 'Sell') {
          positions[tx.instrument].quantity -= tx.quantity
        }
      }

      // Filtra posizioni attive
      const activePositions = Object.values(positions).filter((p: any) => p.quantity > 0)

      // Calcola PMC e P&L (nota: mancano i prezzi correnti, usa valori placeholder)
      const portfolioData = activePositions.map((pos: any) => ({
        ...pos,
        pmc: pos.total_cost / pos.total_units_bought,
        current_price: 0, // Qui ci vorrebbe un'API di prezzi real-time
        current_value: 0,
        pnl: 0,
        pnl_percentage: 0
      }))

      setPortfolio(portfolioData)

      // Calcola sommario
      const totalCost = activePositions.reduce((sum: number, p: any) => sum + p.total_cost, 0)
      setSummary({
        total_value_eur: 0, // Dipende dai prezzi correnti
        total_cost_basis: totalCost,
        total_pnl: 0,
        total_pnl_percentage: 0
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

  return (
    <AuthWrapper>
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📈 Portafoglio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Valore Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{summary.total_value_eur.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Costo Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{summary.total_cost_basis.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">P&L Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{summary.total_pnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">P&L %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.total_pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.total_pnl_percentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Posizioni Attive */}
      <Card>
        <CardHeader>
          <CardTitle>Posizioni Attive</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Caricamento...</p>
          ) : portfolio.length === 0 ? (
            <p className="text-center text-gray-500">Nessuna posizione attiva</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strumento</TableHead>
                    <TableHead>Quantità</TableHead>
                    <TableHead>PMC</TableHead>
                    <TableHead>Prezzo Attuale</TableHead>
                    <TableHead>Valore</TableHead>
                    <TableHead>Costo Base</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>P&L %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map(pos => (
                    <TableRow key={pos.instrument}>
                      <TableCell><strong>{pos.instrument}</strong></TableCell>
                      <TableCell>{pos.quantity.toFixed(4)}</TableCell>
                      <TableCell>€{pos.pmc.toFixed(2)}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>€{pos.total_cost.toFixed(2)}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 mt-4">
        ⚠️ Nota: I prezzi correnti e i P&L in tempo reale richiedono un'API esterna (es. yfinance, TradingView API)
      </p>
    </div>
    </AuthWrapper>
  )
}
