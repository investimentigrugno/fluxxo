'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function PropostePage() {
  const supabase = createClientComponentClient()

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
    target_date: '',
    motivation: '',
    exchange_rate: '1'
  })

  const [proposals, setProposals] = useState<any[]>([])
  const [loadingProposals, setLoadingProposals] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  async function loadProposals() {
    setLoadingProposals(true)
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Errore: ' + error.message)
      setProposals([])
    } else {
      setProposals(data ?? [])
    }
    setLoadingProposals(false)
  }

  useEffect(() => {
    loadProposals()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('proposals')
        .insert([{
          asset: formData.asset.toUpperCase(),
          name: formData.name,
          sector: formData.sector,
          type: formData.type,
          entry_price: parseFloat(formData.entry_price),
          quantity: parseInt(formData.quantity),
          percent_liquidity: parseFloat(formData.percent_liquidity),
          take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
          stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
          currency: formData.currency,
          target_date: formData.target_date,
          motivation: formData.motivation,
          exchange_rate: parseFloat(formData.exchange_rate),
          user_id: user?.id || null,
          status: 'pending',
          votes_approve: 0,
          votes_reject: 0,
          votes_required: 3,
          created_at: new Date().toISOString()
        }])

      if (error) {
        alert('Errore: ' + error.message)
      } else {
        alert('✅ Proposta creata!')
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
          target_date: '',
          motivation: '',
          exchange_rate: '1'
        })
        await loadProposals()
      }
    } catch (error: any) {
      alert('Errore: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">💡 Proposte</h1>

      <Tabs defaultValue="aggiungi" onValueChange={(val) => {
        if (val === 'visualizza') loadProposals()
      }}>
        <TabsList>
          <TabsTrigger value="aggiungi">Aggiungi Proposta</TabsTrigger>
          <TabsTrigger value="visualizza">Visualizza</TabsTrigger>
        </TabsList>

        <TabsContent value="aggiungi">
          <Card>
            <CardHeader>
              <CardTitle>Nuova Proposta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Asset (Ticker)</label>
                    <Input
                      value={formData.asset}
                      onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                      placeholder="Es: AAPL"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Es: Apple Inc"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Settore</label>
                    <Input
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      placeholder="Es: Technology"
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
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.entry_price}
                      onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantità</label>
                    <Input
                      type="number"
                      step="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">% Liquidità</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.percent_liquidity}
                      onChange={(e) => setFormData({ ...formData, percent_liquidity: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Take Profit</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.take_profit}
                      onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stop Loss</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.stop_loss}
                      onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Date</label>
                    <Input
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium mb-1">Motivazione</label>
                  <label className="block text-sm font-medium mb-1">Motivazione</label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Spiega la motivazione della proposta"
                    className="w-full p-2 border rounded resize-y"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Salvataggio...' : 'Salva Proposta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizza">
          <Card>
            <CardContent className="py-8">
              {loadingProposals ? (
                <p className="text-center text-gray-500">Caricamento...</p>
              ) : proposals.length === 0 ? (
                <p className="text-center text-gray-500">Nessuna proposta</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Entry Price</TableHead>
                        <TableHead>Quantità</TableHead>
                        <TableHead>TP</TableHead>
                        <TableHead>SL</TableHead>
                        <TableHead>Valore EUR</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Voti</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map(prop => (
                        <TableRow key={prop.id}>
                          <TableCell>{prop.asset}</TableCell>
                          <TableCell>{prop.type}</TableCell>
                          <TableCell>{prop.entry_price?.toFixed(2)}</TableCell>
                          <TableCell>{prop.quantity}</TableCell>
                          <TableCell>{prop.take_profit?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{prop.stop_loss?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{prop.total_value_eur?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={prop.status === 'approved' ? 'default' : prop.status === 'rejected' ? 'destructive' : 'secondary'}>
                              {prop.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{prop.votes_approve}/{prop.votes_required}</TableCell>
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
