'use client'

import { useEffect, useState } from 'react'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const { portfolio, liquiditaDisponibile, loading } = usePortfolioData()
  const [liquiditaVincolata, setLiquiditaVincolata] = useState(0)

  const liquiditaEffettiva = liquiditaDisponibile - liquiditaVincolata
  const totalPortfolioValue = liquiditaEffettiva + portfolio.reduce((sum, p) => sum + (p.quantita * p.prezzo_medio), 0)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-gray-600">Caricamento portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">📊 Dashboard Portfolio</h1>

      {/* Liquidità Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-600">Liquidità Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(liquiditaDisponibile)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-600">Vincolato (Ordini)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(liquiditaVincolata)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Disponibile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(liquiditaEffettiva)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Attuale ({portfolio.length} asset)</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun asset in portafoglio</p>
          ) : (
            <div className="space-y-4">
              {portfolio.map((asset) => (
                <div key={asset.strumento} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{asset.strumento}</p>
                    <p className="text-sm text-gray-600">
                      {asset.quantita} @ {asset.prezzo_medio.toFixed(2)} EUR
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
                        asset.quantita * asset.prezzo_medio
                      )}
                    </p>
                    <Badge variant={asset.lungo_breve === 'L' ? 'default' : 'destructive'}>
                      {asset.lungo_breve === 'L' ? 'Lungo' : 'Breve'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle>Valore Totale Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totalPortfolioValue)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
