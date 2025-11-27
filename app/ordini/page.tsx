'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function OrdiniPage() {
  const supabase = createClientComponentClient()
  
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  async function loadOrders() {
    setLoadingOrders(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Errore: ' + error.message)
      setOrders([])
    } else {
      setOrders(data ?? [])
    }
    setLoadingOrders(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

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
      alert('✅ Ordine aggiornato!')
      await loadOrders()
    }
  }

  const activeOrders = orders.filter(o => o.status === 'inserted')
  const executedOrders = orders.filter(o => o.status === 'executed')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Ordini</h1>

      <Tabs defaultValue="attivi">
        <TabsList>
          <TabsTrigger value="attivi">Attivi ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="eseguiti">Eseguiti ({executedOrders.length})</TabsTrigger>
          <TabsTrigger value="cancellati">Cancellati ({cancelledOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="attivi">
          <Card>
            <CardContent className="py-8">
              {loadingOrders ? (
                <p className="text-center text-gray-500">Caricamento...</p>
              ) : activeOrders.length === 0 ? (
                <p className="text-center text-gray-500">Nessun ordine attivo</p>
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
                        <TableHead>Azione</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>{order.asset}</TableCell>
                          <TableCell>{order.type}</TableCell>
                          <TableCell>{order.entry_price?.toFixed(2)}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.take_profit?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{order.stop_loss?.toFixed(2) || '-'}</TableCell>
                          <TableCell>{order.total_value_eur?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'executed')}
                            >
                              Esegui
                            </Button>
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

        <TabsContent value="eseguiti">
          <Card>
            <CardContent className="py-8">
              {executedOrders.length === 0 ? (
                <p className="text-center text-gray-500">Nessun ordine eseguito</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Entry Price</TableHead>
                        <TableHead>Quantità</TableHead>
                        <TableHead>Valore EUR</TableHead>
                        <TableHead>Data Esecuzione</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executedOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>{order.asset}</TableCell>
                          <TableCell>{order.type}</TableCell>
                          <TableCell>{order.entry_price?.toFixed(2)}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.total_value_eur?.toFixed(2)}</TableCell>
                          <TableCell>{new Date(order.execution_date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellati">
          <Card>
            <CardContent className="py-8">
              {cancelledOrders.length === 0 ? (
                <p className="text-center text-gray-500">Nessun ordine cancellato</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Entry Price</TableHead>
                        <TableHead>Quantità</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cancelledOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>{order.asset}</TableCell>
                          <TableCell>{order.type}</TableCell>
                          <TableCell>{order.entry_price?.toFixed(2)}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
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
