'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [sessionSupabase, setSessionSupabase] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionSupabase(session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionSupabase(session)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (authLoading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>
  }

  if (!sessionSupabase) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </div>
    )
  }

  return <>{children}</>
}
