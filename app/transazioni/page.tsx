'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TransazioniPage() {
  // Stato form per nuova transazione
  const [formData, setFormData] = useState({
    data: '',
    ora: '',
    tipo: 'Buy',
    strumento: '',
    quantita: '',
    prezzo_unitario: '',
    commissioni: '0',
    broker: '',
    lungo_breve: 'L',
    note: ''
  })

  // Stato per elenco transazioni caricate da Supabase
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Funzione per caricare transazioni, con ordinamento discendente per data
  async function loadTransactions() {
    setLoadingTransactions(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)  // Limite massimo da visualizzare

    if (error) {
      alert('Errore caricamento transazioni: ' + error.message)
      setTransactions([])
    } else {
      setTransactions(data ?? [])
    }
    setLoadingTransactions(false)
  }

  // Caricamento transazioni al montaggio componente
  useEffect(() => {
    loadTransactions()
  }, [])

  // Submit gestione inserimento nuova transazione, con parsing corretto e validazioni minime
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const totale = (parseFloat(formData.quantita) * parseFloat(formData.prezzo_unitario)) +
        parseFloat(formData.commissioni)

      // Costruzione data completa date+time per timestamp supabase
      let dateTime = formData.data
      if (formData.ora) {
        dateTime += 'T' + formData.ora
      } else {
        dateTime += 'T00:00:00'
      }

      const { error } = await supabase
        .from('transactions')
        .insert([{
          date: dateTime,
          type: formData.tipo,
          instrument: formData.strumento.toUpperCase(),
          quantity: parseFloat(formData.quantita),
          unit_price: parseFloat(formData.prezzo_unitario),
          commission: parseFloat(formData.commissioni),
          broker: formData.broker,
          long_short: formData.lungo_breve,
          note: formData.note,
          created_at: new Date().toISOString(),
          user_id: supabase.auth.user()?.id || null,  // Inserisci user id se presente
          order_id: null  // Default null, se usi ordini collegali separatamente
        }])

      if (error) {
        alert('Errore: ' + error.message)
      } else {
        alert('✅ Transazione salvata!')

        setFormData({
          data: '',
          ora: '',
          tipo: 'Buy',
          strumento: '',
          quantita: '',
          prezzo_unitario: '',
          commissioni: '0',
          broker: '',
          lungo_breve: 'L',
          note: ''
        })

        await loadTransactions() // Ricarica lista dopo inserimento
      }
    } catch (error: any) {
      alert('Errore imprevisto: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">💰 Transazioni</h1>

      <Tabs defaultValue="aggiungi" onValueChange={(val) => {
        if (val === 'visualizza') {
          loadTransactions()
        }
      }}>
        <TabsList>
          <TabsTrigger value="aggiungi">Aggiungi Transazione</TabsTrigger>
          <TabsTrigger value="visualizza">Visualizza</TabsTrigger>
        </TabsList>

        {/* Form aggiungi transazione */}
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
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ora</label>
                    <Input
                      type="time"
                      value={formData.ora}
                      onChange={(e) => setFormData({ ...formData, ora: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })} disabled={submitting}>
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

                <div>
                  <label className="block text-sm font-medium mb-1">Strumento (Ticker)</label>
                  <Input
                    value={formData.strumento}
                    onChange={(e) => setFormData({ ...formData, strumento: e.target.value })}
                    placeholder="Es: AAPL, BTC-USD"
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
                      value={formData.quantita}
                      onChange={(e) => setFormData({ ...formData, quantita: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prezzo Unitario</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.prezzo_unitario}
                      onChange={(e) => setFormData({ ...formData, prezzo_unitario: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Lungo/Breve</label>
                  <Select value={formData.lungo_breve} onValueChange={(v) => setFormData({ ...formData, lungo_breve: v })} disabled={submitting}>
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
                  <label className="block text-sm font-medium mb-1">Commissioni</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.commissioni}
                    onChange={(e) => setFormData({ ...formData, commissioni: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Broker</label>
                  <Input
                    value={formData.broker}
                    onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                    disabled={submitting}
                  />
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

        {/* Visualizza transazioni */}
        <TabsContent value="visualizza">
          <Card>
            <CardContent className="py-8">
              {loadingTransactions ? (
                <p className="text-center text-gray-500">Caricamento...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-gray-500">Nessuna transazione trovata</p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.map(tx => (
                    <li key={tx.id} className="border p-2 rounded shadow-sm">
                      <div><strong>Data:</strong> {new Date(tx.date).toLocaleDateString()}</div>
                      <div><strong>Ora:</strong> {tx.date ? new Date(tx.date).toLocaleTimeString() : 'N/A'}</div>
                      <div><strong>Tipo:</strong> {tx.type}</div>
                      <div><strong>Strumento:</strong> {tx.instrument}</div>
                      <div><strong>Quantità:</strong> {tx.quantity}</div>
                      <div><strong>Prezzo Unitario:</strong> {tx.unit_price}</div>
                      <div><strong>Commissioni:</strong> {tx.commission}</div>
                      <div><strong>Broker:</strong> {tx.broker || '-'}</div>
                      <div><strong>Lungo/Breve:</strong> {tx.long_short || '-'}</div>
                      <div><strong>Note:</strong> {tx.note || '-'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
