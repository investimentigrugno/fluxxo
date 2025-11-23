'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function OrdiniPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('data', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        stato_ordine: newStatus,
        data_esecuzione: newStatus === 'Eseguito' ? new Date().toISOString().split('T') : null
      })
      .eq('id', orderId)

    if (!error) {
      alert('✅ Stato aggiornato!')
      loadOrders()
    }
  }

  const ordiniAttivi = orders.filter(o => o.stato_ordine === 'Attivo')
  const ordiniEseguiti = orders.filter(o => o.stato_ordine === 'Eseguito')

  if (loading) return <div className="container mx-auto p-6">Caricamento...</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📦 Ordini</h1>

      <Tabs defaultValue="attivi">
        <TabsList>
          <TabsTrigger value="attivi">Attivi ({ordiniAttivi.length})</TabsTrigger>
          <TabsTrigger value="eseguiti">Eseguiti ({ordiniEseguiti.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="attivi">
          <Card>
            <CardHeader>
              <CardTitle>Ordini Attivi</CardTitle>
            </CardHeader>
            <CardContent>
              {ordiniAttivi.length === 0 ? (
                <p className="text-center py-8 text-gray-500">✅ Nessun ordine attivo</p>
              ) : (
                <div className="space-y-4">
                  {ordiniAttivi.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{order.asset} - {order.tipo_ordine}</p>
                        <p className="text-sm text-gray-600">{order.quantita} @ {order.prezzo} EUR</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'Eseguito')}
                        >
                          ✓ Eseguito
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'Cancellato')}
                        >
                          ✗ Cancella
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eseguiti">
          <Card>
            <CardHeader>
              <CardTitle>Ordini Eseguiti</CardTitle>
            </CardHeader>
            <CardContent>
              {ordiniEseguiti.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nessun ordine eseguito</p>
              ) : (
                <div className="space-y-4">
                  {ordiniEseguiti.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{order.asset}</p>
                          <p className="text-sm text-gray-600">{order.quantita} @ {order.prezzo} EUR</p>
                          <p className="text-xs text-gray-500">{order.data_esecuzione}</p>
                        </div>
                        <Badge>Eseguito</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
