"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../components/AuthProvider'
import { Lock, Home } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const initial = (search?.get('plan') || 'Free')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState(initial)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPlan(initial)
  }, [initial])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await register(email, password, plan.toLowerCase())
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main>
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
              <Home className="w-5 h-5" />
              Home
            </Link>
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Create account</h1>
            </div>
            <div style={{ width: 64 }} />
          </div>
          <p className="text-slate-400">Register and pick a plan to get started.</p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={onSubmit} className="space-y-4">
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded bg-slate-900" />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded bg-slate-900" />
            <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-3 py-2 border rounded bg-slate-900">
              <option>Free</option>
              <option>Pro</option>
              <option>Business</option>
              <option>Enterprise</option>
            </select>
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex items-center justify-start">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">Register</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
