"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function RequireAuth({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading || !user) return <div>Loading...</div>

  if (role && user.role !== role) return <div>Unauthorized</div>

  return <>{children}</>
}
