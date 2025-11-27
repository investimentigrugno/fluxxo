'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TransazioniPage() {
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState({
    date: '',
    type: 'Buy',
    instrument: '',
    quantity: '',
    unit_price: '',
    commission: '0',
    broker: '',
    long_short: 'L',
    note: '',
    currency: 'EUR',
    exchange_rate: '1'
  })

  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  async function loadTransactions() {
    setLoadingTransactions(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)

    if (error) {
      alert('Errore caricamento: ' + error.message)
      setTransactions([])
    } else {
      setTransactions(data ?? [])
    }
    setLoadingTransactions(false)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          date: formData.date,
          type: formData.type,
          instrument: formData.instrument.toUpperCase(),
          quantity: parseFloat(formData.quantity),
          unit_price: parseFloat(formData.unit_price),
          commission: parseFloat(formData.commission),
          broker: formData.broker || null,
          long_short: formData.long_short,
          note: formData.note || null,
          currency: formData.currency,
          exchange_rate: parseFloat(formData.exchange_rate),
          user_id: user?.id || null,
          order_id: null,
          created_at: new Date().toISOString()
        }])

      if (error) {
        alert('Errore: ' + error.message)
      } else {
        alert('✅ Transazione salvata!')
        setFormData({
          date: '',
          type: 'Buy',
          instrument: '',
          quantity: '',
          unit_price: '',
          commission: '0',
          broker: '',
          long_short: 'L',
          note: '',
          currency: 'EUR',
          exchange_rate: '1'
        })
        await loadTransactions()
      }
    } catch (error: any) {
      alert('Errore: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">💰 Transazioni</h1>

      <Tabs defaultValue="aggiungi" onValueChange={(val) => {
        if (val === 'visualizza') loadTransactions()
      }}>
        <TabsList>
          <TabsTrigger value="aggiungi">Aggiungi Transazione</TabsTrigger>
          <TabsTrigger value="visualizza">Visualizza</TabsTrigger>
        </TabsList>

        <TabsContent value="aggiungi">
          <Card>
            <CardHeader>
              <CardTitle>Nuova Transazione</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} disabled={submitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">Acquisto</SelectItem>
                        <SelectItem value="Sell">Vendita</SelectItem>
                        <SelectItem value="Deposit">Deposito</SelectItem>
                        <SelectItem value="Withdraw">Prelievo</SelectItem>
                        <SelectItem value="Dividend">Dividendo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Strumento (Ticker)</label>
                  <Input
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    placeholder="Es: AAPL, BTCEUR"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantità</label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prezzo Unitario</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Commissioni</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valuta</label>
                    <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })} disabled={submitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tasso Cambio</label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.exchange_rate}
                      onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lungo/Breve</label>
                    <Select value={formData.long_short} onValueChange={(v) => setFormData({ ...formData, long_short: v })} disabled={submitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Lungo (L)</SelectItem>
                        <SelectItem value="B">Breve (B)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Broker</label>
                    <Input
                      value={formData.broker}
                      onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Note</label>
                  <Input
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Salvataggio...' : 'Salva Transazione'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizza">
          <Card>
            <CardContent className="py-8">
              {loadingTransactions ? (
                <p className="text-center text-gray-500">Caricamento...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-gray-500">Nessuna transazione</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Strumento</TableHead>
                        <TableHead>Quantità</TableHead>
                        <TableHead>Prezzo Unit.</TableHead>
                        <TableHead>Commissioni</TableHead>
                        <TableHead>Valuta</TableHead>
                        <TableHead>Cambio</TableHead>
                        <TableHead>Valore EUR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                          <TableCell>{tx.type}</TableCell>
                          <TableCell>{tx.instrument}</TableCell>
                          <TableCell>{tx.quantity}</TableCell>
                          <TableCell>{tx.unit_price?.toFixed(2)}</TableCell>
                          <TableCell>{tx.commission?.toFixed(2)}</TableCell>
                          <TableCell>{tx.currency}</TableCell>
                          <TableCell>{tx.exchange_rate?.toFixed(4)}</TableCell>
                          <TableCell>{tx.total_value_eur?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
