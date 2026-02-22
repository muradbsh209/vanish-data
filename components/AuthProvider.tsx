"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id: string
  email: string
  role: string
  planName: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, planName?: string, role?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => typeof window !== 'undefined' ? localStorage.getItem('token') : null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setUser(data.user)
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('token', data.token)
      setUser(data.user)
    } else {
      throw new Error(data.error || 'Login failed')
    }
  }

  async function register(email: string, password: string, planName = 'Free', role = 'free') {
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, planName, role }) })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('token', data.token)
      setUser(data.user)
    } else {
      throw new Error(data.error || 'Register failed')
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
