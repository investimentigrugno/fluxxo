'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import AuthWrapper from '@/components/ui/AuthWrapper'

export default function PropostePage() {
  const supabase = createClientComponentClient()
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    asset: '',
    name: '',
    sector: '',
    type: 'BUY',
    entry_price: '',
    quantity: '',
    percent_liquidity: '',
    take_profit: '',
    stop_loss: '',
    currency: 'EUR',
    exchange_rate: '1',
    target_date: '',
    motivation: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])

  async function getPortfolioValueEUR(): Promise<number> {
    // Ricavare dal database il valore totale del portafoglio
    const { data } = await supabase
      .from('transactions')
      .select('quantity, unit_price, exchange_rate, type')
    
    if (!data) return 100000.0
    
    let totalValue = 0
    data.forEach((tx: any) => {
      const value = (parseFloat(tx.quantity) * parseFloat(tx.unit_price) * parseFloat(tx.exchange_rate || 1))
      if (tx.type === 'Buy') totalValue += value
      else if (tx.type === 'Sell') totalValue -= value
    })
    
    return totalValue || 100000.0
  }

  async function fetchTickerInfo(ticker: string) {
    if (!ticker) return

    try {
      const res = await fetch('/api/ticker/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setFormData(prev => ({
        ...prev,
        entry_price: data.price.toFixed(2),
        currency: data.currency,
        sector: data.sector,
        name: data.name
      }))

      return data.currency
    } catch (error: any) {
      console.error('Errore recupero info ticker:', error.message)
      return null
    }
  }

  async function getExchangeRate(fromCurrency: string, toCurrency = 'EUR') {
    if (fromCurrency === toCurrency) return 1.0
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`)
      const data = await res.json()
      return data.rates[toCurrency] ?? 1.0
    } catch (error) {
      console.error('Frankfurter error:', error)
      return 1.0
    }
  }

  async function calculatePercentLiquidity(entryPrice: number, quantity: number, currency: string) {
    const portfolioEURValue = await getPortfolioValueEUR()
    const rate = await getExchangeRate(currency, 'EUR')
    const totalValueEUR = entryPrice * quantity * rate
    return (totalValueEUR / portfolioEURValue) * 100
  }

  async function handleTickerChange(ticker: string) {
    if (!ticker) return

    const currency = await fetchTickerInfo(ticker)
    if (!currency) return

    const ep = parseFloat(formData.entry_price)
    const qty = parseFloat(formData.quantity)
    const rate = await getExchangeRate(currency, 'EUR')

    if (isNaN(ep) || isNaN(qty)) {
      setFormData(prev => ({ ...prev, percent_liquidity: '', exchange_rate: rate.toFixed(4) }))
      return
    }

    const percent = await calculatePercentLiquidity(ep, qty, currency)
    setFormData(prev => ({ ...prev, percent_liquidity: percent.toFixed(2), exchange_rate: rate.toFixed(4) }))
  }

  async function loadProposals() {
    setLoading(true)
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore:', error)
      alert('Errore nel caricamento delle proposte')
    } else {
      setProposals(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProposals()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    if (!formData.asset || !formData.entry_price || !formData.quantity) {
      alert('Compila tutti i campi obbligatori')
      setSubmitting(false)
      return
    }

    try {
      const { error } = await supabase.from('proposals').insert([{
        asset: formData.asset.toUpperCase(),
        name: formData.name || null,
        sector: formData.sector || null,
        type: formData.type,
        entry_price: parseFloat(formData.entry_price),
        quantity: parseInt(formData.quantity),
        percent_liquidity: formData.percent_liquidity ? parseFloat(formData.percent_liquidity) : null,
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
        currency: formData.currency,
        exchange_rate: parseFloat(formData.exchange_rate),
        target_date: formData.target_date || null,
        motivation: formData.motivation || null,
        status: 'pending',
        user_id: user?.id || null,
        created_at: new Date().toISOString()
      }])

      if (error) {
        alert('Errore: ' + error.message)
      } else {
        alert('✅ Proposta creata con successo')
        setFormData({
          asset: '',
          name: '',
          sector: '',
          type: 'BUY',
          entry_price: '',
          quantity: '',
          percent_liquidity: '',
          take_profit: '',
          stop_loss: '',
          currency: 'EUR',
          exchange_rate: '1',
          target_date: '',
          motivation: ''
        })
        await loadProposals()
      }
    } catch (error: any) {
      alert('Errore: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const totalAmountEUR = (
  (parseFloat(formData.entry_price) || 0) * 
  (parseFloat(formData.quantity) || 0) * 
  (parseFloat(formData.exchange_rate) || 1)
).toFixed(2)


  return (
    <AuthWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">💡 Proposte</h1>

        <Tabs defaultValue="visualizza" onValueChange={(val) => {
          if (val === 'visualizza') loadProposals()
        }}>
          <TabsList>
            <TabsTrigger value="visualizza">Visualizza</TabsTrigger>
            <TabsTrigger value="aggiungi">Aggiungi Proposta</TabsTrigger>
          </TabsList>

          <TabsContent value="visualizza">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-gray-600">Caricamento...</p>
              </div>
            ) : proposals.length === 0 ? (
              <p className="text-center text-gray-500">Nessuna proposta</p>
            ) : (
              <div className="space-y-4">
                {proposals.map((prop) => (
                  <Card key={prop.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{prop.asset} - {prop.type}</h3>
                          <p className="text-sm text-gray-600">{new Date(prop.created_at).toLocaleString()}</p>
                          {prop.name && <p className="text-sm text-gray-500">{prop.name}</p>}
                          {prop.sector && <p className="text-xs text-gray-400">Settore: {prop.sector}</p>}
                        </div>
                        <span className="inline-block bg-gray-200 rounded px-2 py-1 text-xs font-semibold">
                          {prop.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Entry Price</p>
                          <p className="font-semibold">{prop.entry_price.toFixed(2)} {prop.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-semibold">{prop.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Liquidity %</p>
                          <p className="font-semibold">{prop.percent_liquidity?.toFixed(2) ?? 'N/A'}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Exchange Rate</p>
                          <p className="font-semibold">{prop.exchange_rate?.toFixed(4) ?? '1'}</p>
                        </div>
                      </div>
                      {prop.take_profit && (
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Take Profit</p>
                            <p className="font-semibold">{prop.take_profit.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Stop Loss</p>
                            <p className="font-semibold">{prop.stop_loss?.toFixed(2) ?? '-'}</p>
                          </div>
                        </div>
                      )}
                      {prop.motivation && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Motivation:</p>
                          <p className="text-sm">{prop.motivation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="aggiungi">
            <Card>
              <CardHeader>
                <CardTitle>Nuova Proposta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ticker (Yahoo Finance)</label>
                    <Input
                      value={formData.asset}
                      onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                      onBlur={() => handleTickerChange(formData.asset)}
                      placeholder="Es: AAPL, ISP.MI, BTCEUR"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome Azienda</label>
                      <Input
                        value={formData.name}
                        readOnly
                        placeholder="Auto-riempito da yfinance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Settore</label>
                      <Input
                        value={formData.sector}
                        readOnly
                        placeholder="Auto-riempito da yfinance"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} disabled={submitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Entry Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.entry_price}
                        onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                        placeholder="Auto da yfinance"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Currency</label>
                      <Input
                        value={formData.currency}
                        readOnly
                        placeholder="Auto da yfinance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Exchange Rate to EUR</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.exchange_rate}
                        onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                        readOnly
                        placeholder="Auto-calcolato"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Amount EUR</label>
                      <Input
                        type="number"
                        value={totalAmountEUR}
                        readOnly
                        placeholder="Auto-calcolato"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Percent Liquidity</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.percent_liquidity}
                        readOnly
                        placeholder="Auto-calcolato"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Take Profit (optional)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.take_profit}
                        onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stop Loss (optional)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.stop_loss}
                        onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Target Date (optional)</label>
                    <Input
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                      disabled={submitting}
                    />
                  </div>

                  {formData.asset && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Yahoo Finance Link</label>
                      <a 
                        href={`https://finance.yahoo.com/quote/${formData.asset}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        https://finance.yahoo.com/quote/{formData.asset}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Motivation (optional)</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows={4}
                      value={formData.motivation}
                      onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                      placeholder="Spiega le tue ragioni..."
                      disabled={submitting}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthWrapper>
  )
}
