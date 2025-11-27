'use client'

import { useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  children: ReactNode
}

export default function AuthWrapper({ children }: Props) {
  const supabase = createClientComponentClient()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session ?? null)
      setLoading(false)
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert('Errore login: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl">Caricamento...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Accedi</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
