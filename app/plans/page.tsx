"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Lock } from 'lucide-react'

const plans = [
  { key: 'Free', title: 'Free', price: 'Free', bullets: ['1:1 messaging', '24h auto-delete', 'limited file size'] },
  { key: 'Pro', title: 'Pro', price: '$8 / user / month', bullets: ['Choose expiry', '5 GB file limit', 'one-time access', 'basic audit', '2FA'] },
  { key: 'Business', title: 'Business', price: '$12 / user / month', bullets: ['Unlimited expiry', '20 GB', 'admin panel', 'audit system'] },
  { key: 'Enterprise', title: 'Enterprise', price: '$18–25 / user / month', bullets: ['Dedicated server', 'On-premise', 'Compliance & SLA'] },
]

export default function PlansPage() {
  const router = useRouter()

  function choose(planKey: string) {
    // Navigate to register with preselected plan
    router.push(`/register?plan=${encodeURIComponent(planKey)}`)
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Plans & Pricing</h1>
              </div>
              <div style={{ width: 64 }} />
            </div>
            <p className="text-slate-400">Choose a plan that fits your needs.</p>
          </div>

        <div className="grid md:grid-cols-2 gap-4">
          {plans.map(p => (
            <div key={p.key} className="rounded-xl p-6 bg-slate-800/40 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{p.title}</h2>
                  <p className="text-sm text-slate-400">{p.price}</p>
                </div>
                <button onClick={() => choose(p.key)} className="px-3 py-2 bg-indigo-600 rounded text-white">Choose</button>
              </div>
              <ul className="mt-4 text-sm text-slate-300 space-y-1">
                {p.bullets.map(b => <li key={b}>• {b}</li>)}
              </ul>
            </div>
          ))}
        </div>

        
      </div>
    </main>
  )
}
