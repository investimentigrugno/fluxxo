'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function PropostePage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    asset: '',
    type: 'BUY',
    entry_price: '',
    quantity: '',
    percent_liquidity: '',
    take_profit: '',
    stop_loss: '',
    currency: 'EUR',
    target_date: '',
    motivation: ''
  })

  useEffect(() => {
    loadProposals()
  }, [])

  async function loadProposals() {
    setLoading(true)
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Errore nel caricamento delle proposte')
      console.error(error)
      setLoading(false)
      return
    }

    setProposals(data || [])
    setLoading(false)
  }


  async function handleSubmitProposal(e: React.FormEvent) {
    e.preventDefault()

    const now = new Date()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      alert('Errore autenticazione utente')
      return
    }

    const proposalData = {
      created_at: now.toISOString(),
      asset: formData.asset,
      type: formData.type,
      entry_price: parseFloat(formData.entry_price),
      quantity: parseInt(formData.quantity),
      percent_liquidity: formData.percent_liquidity ? parseFloat(formData.percent_liquidity) : null,
      take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
      stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
      currency: formData.currency,
      target_date: formData.target_date ? formData.target_date : null,
      motivation: formData.motivation || null,
      status: 'pending',
      user_id: userData.user.id
    }

    const { error } = await supabase
      .from('proposals')
      .insert([proposalData])

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      alert('✅ Proposta creata!')
      setFormData({
        asset: '',
        type: 'BUY',
        entry_price: '',
        quantity: '',
        percent_liquidity: '',
        take_profit: '',
        stop_loss: '',
        currency: 'EUR',
        target_date: '',
        motivation: ''
      })
      loadProposals()
    }
  }


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Investment Proposals</h1>

      <Tabs defaultValue="view">
        <TabsList>
          <TabsTrigger value="view">View Proposals</TabsTrigger>
          <TabsTrigger value="add">Add Proposal</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>All Proposals ({proposals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-600">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  Loading proposals...
                </div>
              ) : proposals.length === 0 ? (
                <p className="text-gray-500">No proposals found</p>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{prop.asset} - {prop.type}</h3>
                          <p className="text-sm text-gray-600">{new Date(prop.created_at).toLocaleString()}</p>
                        </div>
                        <Badge>{prop.status}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Entry Price</p>
                          <p className="font-semibold">{prop.entry_price.toFixed(2)} {prop.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-semibold">{prop.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Votes in Favor</p>
                          <p className="font-semibold">{prop.votes_approve ?? 0}/3</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Asset</label>
                  <Input
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    placeholder="E.g.: AAPL"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
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
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Percent Liquidity</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.percent_liquidity}
                    onChange={(e) => setFormData({ ...formData, percent_liquidity: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Take Profit (optional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.take_profit}
                      onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stop Loss (optional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.stop_loss}
                      onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    placeholder="USD"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Target Date (optional)</label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Motivation (optional)</label>
                  <textarea
                    className="w-full border p-2 rounded"
                    rows={4}
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Explain your reasons..."
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Submit Proposal
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
