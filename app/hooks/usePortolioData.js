import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function usePortfolioData() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [liquiditaDisponibile, setLiquiditaDisponibile] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolioData()
  }, [])

  async function loadPortfolioData() {
    try {
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('data', { ascending: false })

      setTransactions(txData || [])

      let liquidita = 0
      txData?.forEach(tx => {
        if (tx.tipo === 'Deposito') liquidita += tx.totale
        if (tx.tipo === 'Prelievo') liquidita -= tx.totale
        if (tx.tipo === 'Acquisto') liquidita -= tx.totale
        if (tx.tipo === 'Vendita') liquidita += tx.totale
      })
      setLiquiditaDisponibile(liquidita)

      const portfolioMap = new Map()
      txData?.forEach(tx => {
        if (tx.tipo === 'Acquisto' || tx.tipo === 'Vendita') {
          const key = tx.strumento
          const existing = portfolioMap.get(key) || {
            strumento: tx.strumento,
            quantita: 0,
            prezzo_medio: 0,
            lungo_breve: tx.lungo_breve || 'L'
          }

          if (tx.tipo === 'Acquisto') {
            const newQty = existing.quantita + (tx.quantita || 0)
            existing.prezzo_medio = ((existing.quantita * existing.prezzo_medio) + 
                               ((tx.quantita || 0) * (tx.prezzo_unitario || 0))) / newQty
            existing.quantita = newQty
          } else {
            existing.quantita -= (tx.quantita || 0)
          }

          if (existing.quantita > 0) {
            portfolioMap.set(key, existing)
          }
        }
      })

      setPortfolio(Array.from(portfolioMap.values()))
      setLoading(false)

    } catch (error) {
      console.error('Errore:', error)
      setLoading(false)
    }
  }

  return { transactions, portfolio, liquiditaDisponibile, loading, refetch: loadPortfolioData }
}
