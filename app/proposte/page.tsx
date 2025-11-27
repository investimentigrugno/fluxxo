'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function PropostePage() {

  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    getExchangeRate: '',
    target_date: '',
    motivation: ''
  })

  async function getPortfolioValueEUR(): Promise<number> {
    // Sostituisci con valore reale calcolato dinamicamente
    return 100000.0
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
      alert('Errore recupero info ticker: ' + error.message)
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
    const qty = parseInt(formData.quantity)
    const rate = await getExchangeRate(currency, 'EUR')

    if (isNaN(ep) || isNaN(qty)) {
      setFormData(prev => ({ ...prev, percent_liquidity: '', getExchangeRate: rate.toFixed(4) }))
      return
    }

    const percent = await calculatePercentLiquidity(ep, qty, currency)
    setFormData(prev => ({ ...prev, percent_liquidity: percent.toFixed(2), getExchangeRate: rate.toFixed(4) }))
  }

  async function loadProposals() {
    setLoading(true)
    const { data, error } = await supabase.from('proposals').select('*').order('created_at', { ascending: false })
    if (error) {
      alert('Errore nel caricamento delle proposte')
      console.error(error)
      setLoading(false)
      return
    }
    setProposals(data || [])
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

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      alert('Utente non autenticato')
      setSubmitting(false)
      return
    }

    const newProposal = {
      created_at: new Date().toISOString(),
      asset: formData.asset,
      type: formData.type,
      entry_price: parseFloat(formData.entry_price),
      quantity: parseInt(formData.quantity),
      percent_liquidity: formData.percent_liquidity ? parseFloat(formData.percent_liquidity) : null,
      take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
      stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
      currency: formData.currency,
      target_date: formData.target_date || null,
      motivation: formData.motivation || null,
      status: 'pending',
      user_id: userData.user.id,
      exchange_rate: parseFloat(formData.getExchangeRate)
    }

    const { error } = await supabase.from('proposals').insert([newProposal])

    if (error) {
      alert('Errore inserimento proposta: ' + error.message)
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
        getExchangeRate: '',
        target_date: '',
        motivation: ''
      })
      await loadProposals()
    }

    setSubmitting(false)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">💡 Proposte</h1>

      <Tabs defaultValue="visualizza" onValueChange={(val) => { if (val === 'visualizza') loadProposals() }}>
        <TabsList>
          <TabsTrigger value="visualizza">Visualizza</TabsTrigger>
          <TabsTrigger value="aggiungi">Aggiungi Proposta</TabsTrigger>
        </TabsList>
        <TabsContent value="visualizza">
          {/* Visualizza lista proposte */}
          <div className="space-y-4">
            {loading ? (
              <p>Caricamento...</p>
            ) : (
              proposals.map(proposal => (
                <div key={proposal.id} className="border p-4 rounded shadow">
                  <h2 className="text-xl font-bold">{proposal.asset} - {proposal.type}</h2>
                  <p>Entry Price: {proposal.entry_price?.toFixed(2)} {proposal.currency}</p>
                  <p>Quantity: {proposal.quantity}</p>
                  <p>Percent Liquidity: {proposal.percent_liquidity?.toFixed(2) ?? 'N/A'}%</p>
                  <p>Status: {proposal.status}</p>
                  <p>Motivation: {proposal.motivation}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="aggiungi">
          {/* Form inserimento proposta */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Asset (Ticker)"
              value={formData.asset}
              onChange={e => setFormData({ ...formData, asset: e.target.value })}
              onBlur={() => handleTickerChange(formData.asset)}
              placeholder="Es: AAPL, ISP.MI"
              required
            />
            <Input label="Entry Price" type="number" step="0.01" value={formData.entry_price} onChange={e => setFormData({ ...formData, entry_price: e.target.value })} required />
            <Input label="Quantity" type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
            <Input label="Percent Liquidity" type="number" step="0.01" value={formData.percent_liquidity} disabled />
            <Select label="Currency" value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
            <Input label="Exchange Rate" type="number" step="0.0001" value={formData.getExchangeRate} disabled />
            <Input label="Take Profit" type="number" step="0.01" value={formData.take_profit} onChange={e => setFormData({ ...formData, take_profit: e.target.value })} />
            <Input label="Stop Loss" type="number" step="0.01" value={formData.stop_loss} onChange={e => setFormData({ ...formData, stop_loss: e.target.value })} />
            <Input label="Target Date" type="date" value={formData.target_date} onChange={e => setFormData({ ...formData, target_date: e.target.value })} />
            <label className="block text-sm font-medium mb-1">Motivation</label>
            <textarea
              value={formData.motivation}
              onChange={e => setFormData({ ...formData, motivation: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Explain your reasons..."
            />
            <Button type="submit" disabled={submitting} className="w-full">Submit Proposal</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
