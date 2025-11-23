'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TransazioniPage() {
  const [formData, setFormData] = useState({
    data: '',
    ora: '',
    tipo: 'Acquisto',
    strumento: '',
    quantita: '',
    prezzo_unitario: '',
    commissioni: '0',
    broker: '',
    lungo_breve: 'L',
    note: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const totale = (parseFloat(formData.quantita) * parseFloat(formData.prezzo_unitario)) + 
                   parseFloat(formData.commissioni)

    const { error } = await supabase
      .from('transactions')
      .insert([{
        ...formData,
        quantita: parseFloat(formData.quantita),
        prezzo_unitario: parseFloat(formData.prezzo_unitario),
        commissioni: parseFloat(formData.commissioni),
        totale,
        valuta: 'EUR'
      }])

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      alert('✅ Transazione salvata!')
      setFormData({
        data: '',
        ora: '',
        tipo: 'Acquisto',
        strumento: '',
        quantita: '',
        prezzo_unitario: '',
        commissioni: '0',
        broker: '',
        lungo_breve: 'L',
        note: ''
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">💰 Transazioni</h1>

      <Tabs defaultValue="aggiungi">
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
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ora</label>
                    <Input 
                      type="time" 
                      value={formData.ora}
                      onChange={(e) => setFormData({...formData, ora: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Acquisto">Acquisto</SelectItem>
                      <SelectItem value="Vendita">Vendita</SelectItem>
                      <SelectItem value="Deposito">Deposito</SelectItem>
                      <SelectItem value="Prelievo">Prelievo</SelectItem>
                      <SelectItem value="Dividendo">Dividendo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Strumento (Ticker)</label>
                  <Input 
                    value={formData.strumento}
                    onChange={(e) => setFormData({...formData, strumento: e.target.value})}
                    placeholder="Es: AAPL, BTC-USD"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantità</label>
                    <Input 
                      type="number" 
                      step="0.0001"
                      value={formData.quantita}
                      onChange={(e) => setFormData({...formData, quantita: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prezzo Unitario</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.prezzo_unitario}
                      onChange={(e) => setFormData({...formData, prezzo_unitario: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Lungo/Breve</label>
                  <Select value={formData.lungo_breve} onValueChange={(v) => setFormData({...formData, lungo_breve: v})}>
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
                    onChange={(e) => setFormData({...formData, commissioni: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">Salva Transazione</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizza">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Transazioni caricate qui</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
