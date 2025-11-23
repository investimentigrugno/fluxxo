'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PropostePage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [formData, setFormData] = useState({
    asset: '',
    proposta: 'BUY',
    entry_price: '',
    n_azioni: '',
    perc_liquidita: ''
  })

  useEffect(() => {
    loadProposals()
  }, [])

  async function loadProposals() {
    const { data } = await supabase
      .from('proposals')
      .select('*')
      .order('data', { ascending: false })
    
    setProposals(data || [])
  }

  async function handleSubmitProposal(e: React.FormEvent) {
    e.preventDefault()

    const now = new Date()
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('proposals')
      .insert([{
        data: now.toISOString().split('T'),
        time: now.toTimeString().split(' '),
        asset: formData.asset,
        proposta: formData.proposta,
        entry_price: parseFloat(formData.entry_price),
        n_azioni: parseInt(formData.n_azioni),
        perc_liquidita: parseFloat(formData.perc_liquidita),
        stato: 'In Votazione',
        voto_favore: 0,
        user_id: user.user?.id,
        valuta: 'EUR',
        controvalore_eur: parseFloat(formData.entry_price) * parseInt(formData.n_azioni)
      }])

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      alert('✅ Proposta creata!')
      setFormData({ asset: '', proposta: 'BUY', entry_price: '', n_azioni: '', perc_liquidita: '' })
      loadProposals()
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Proposte</h1>

      <Tabs defaultValue="visualizza">
        <TabsList>
          <TabsTrigger value="visualizza">Visualizza Proposte</TabsTrigger>
          <TabsTrigger value="aggiungi">Aggiungi Proposta</TabsTrigger>
        </TabsList>

        <TabsContent value="visualizza">
          <Card>
            <CardHeader>
              <CardTitle>Tutte le Proposte ({proposals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <p className="text-gray-500">Nessuna proposta</p>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{prop.asset} - {prop.proposta}</h3>
                          <p className="text-sm text-gray-600">{prop.data} {prop.time}</p>
                        </div>
                        <Badge>{prop.stato}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Entry Price</p>
                          <p className="font-semibold">{prop.entry_price.toFixed(2)} EUR</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">N. Azioni</p>
                          <p className="font-semibold">{prop.n_azioni}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Voti</p>
                          <p className="font-semibold">{prop.voto_favore}/3</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aggiungi">
          <Card>
            <CardHeader>
              <CardTitle>Nuova Proposta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Asset</label>
                  <Input 
                    value={formData.asset}
                    onChange={(e) => setFormData({...formData, asset: e.target.value})}
                    placeholder="Es: AAPL"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <Select value={formData.proposta} onValueChange={(v) => setFormData({...formData, proposta: v})}>
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
                    <label className="block text-sm font-medium mb-1">Entry Price (EUR)</label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.entry_price}
                      onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">N. Azioni</label>
                    <Input 
                      type="number"
                      value={formData.n_azioni}
                      onChange={(e) => setFormData({...formData, n_azioni: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">% Liquidità</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.perc_liquidita}
                    onChange={(e) => setFormData({...formData, perc_liquidita: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">Crea Proposta</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
