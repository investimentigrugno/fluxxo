'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AuthWrapper from '@/components/ui/AuthWrapper'

export default function OrdiniPage() {
  const supabase = createClientComponentClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore:', error)
      alert('Errore caricamento ordini')
    } else {
      setOrders(data ?? [])
    }
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        execution_date: newStatus === 'executed' ? new Date().toISOString() : null
      })
      .eq('id', orderId)

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      alert('✅ Ordine aggiornato')
      await loadOrders()
    }
  }

  const statusColors: any = {
    inserted: 'bg-yellow-100 text-yellow-800',
    executed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const filteredOrders = (status: string) => orders.filter(o => o.status === status)

  return (
    <AuthWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📋 Ordini</h1>

        <Tabs defaultValue="inserted">
          <TabsList>
            <TabsTrigger value="inserted">
              Inseriti ({filteredOrders('inserted').length})
            </TabsTrigger>
            <TabsTrigger value="executed">
              Eseguiti ({filteredOrders('executed').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancellati ({filteredOrders('cancelled').length})
            </TabsTrigger>
          </TabsList>

          {['inserted', 'executed', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status}>
              <Card>
                <CardContent className="py-8">
                  {loading ? (
                    <p className="text-center text-gray-500">Caricamento...</p>
                  ) : filteredOrders(status).length === 0 ? (
                    <p className="text-center text-gray-500">Nessun ordine</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Entry Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Take Profit</TableHead>
                            <TableHead>Stop Loss</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders(status).map(order => (
                            <TableRow key={order.id}>
                              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{order.asset}</TableCell>
                              <TableCell>{order.type}</TableCell>
                              <TableCell>{order.entry_price?.toFixed(2)}</TableCell>
                              <TableCell>{order.quantity}</TableCell>
                              <TableCell>{order.take_profit?.toFixed(2) ?? '-'}</TableCell>
                              <TableCell>{order.stop_loss?.toFixed(2) ?? '-'}</TableCell>
                              <TableCell>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[order.status]}`}>
                                  {order.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                {status === 'inserted' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, 'executed')}
                                  >
                                    Esegui
                                  </Button>
                                )}
                                {status !== 'cancelled' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  >
                                    Cancella
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AuthWrapper>
  )
}
