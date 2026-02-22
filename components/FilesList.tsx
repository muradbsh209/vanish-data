'use client'

import React, { useEffect, useState } from 'react'
import { Copy, Trash2, Clock, Lock, Type, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface Share {
  id: string
  name: string
  expiresAt: number
  createdAt: number
  mimeType: string
  key: string
  isText?: boolean
}

export function FilesList() {
  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    // Get both files and text shares from localStorage
    const files = JSON.parse(localStorage.getItem('vanishdata_uploads') || '[]')
    const texts = JSON.parse(localStorage.getItem('vanishdata_shares') || '[]')
    const allShares = [...files, ...texts].sort((a, b) => b.createdAt - a.createdAt)
    setShares(allShares)
    setLoading(false)
  }, [])

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Just update state to trigger re-render, don't filter expired items
      setShares(prev => [...prev])
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (text: string, shareId: string) => {
    navigator.clipboard.writeText(text)
    setCopied(shareId)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteShare = async (shareId: string) => {
    try {
      await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shareId })
      })
      setShares(prev => {
        const updated = prev.filter(f => f.id !== shareId)
        const files = updated.filter(s => !s.isText)
        const texts = updated.filter(s => s.isText)
        localStorage.setItem('vanishdata_uploads', JSON.stringify(files))
        localStorage.setItem('vanishdata_shares', JSON.stringify(texts))
        return updated
      })
    } catch (e) {
      console.error('Failed to delete share:', e)
    }
  }

  const deleteExpired = async () => {
    const expired = shares.filter(s => s.expiresAt <= Date.now())
    if (expired.length === 0) return
    if (!confirm(`Delete ${expired.length} expired share(s)? This cannot be undone.`)) return

    try {
      await Promise.all(expired.map(s => fetch('/api/files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) })))
      const remaining = shares.filter(s => s.expiresAt > Date.now())
      setShares(remaining)
      const files = remaining.filter(s => !s.isText)
      const texts = remaining.filter(s => s.isText)
      localStorage.setItem('vanishdata_uploads', JSON.stringify(files))
      localStorage.setItem('vanishdata_shares', JSON.stringify(texts))
    } catch (e) {
      console.error('Failed to delete expired shares:', e)
    }
  }

  const deleteAll = async () => {
    if (shares.length === 0) return
    if (!confirm(`Delete ALL ${shares.length} share(s)? This cannot be undone.`)) return
    try {
      await Promise.all(shares.map(s => fetch('/api/files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) })))
      setShares([])
      localStorage.removeItem('vanishdata_uploads')
      localStorage.removeItem('vanishdata_shares')
    } catch (e) {
      console.error('Failed to delete all shares:', e)
    }
  }

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now()
    if(expiresAt <= now) {
      return 'Expired'
    }
    const remaining = Math.floor((expiresAt - now) / 1000)
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (shares.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 p-8 text-center">
          <Lock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-300 mb-2">No shares yet</p>
          <p className="text-sm text-slate-400">Go back to share a file or text and it will appear here</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Your Shares</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={deleteExpired}
            className="px-3 py-2 rounded-md bg-red-600/10 border border-red-500/30 text-red-300 hover:bg-red-600/20 transition"
          >
            Delete expired
          </button>
          <button
            onClick={deleteAll}
            className="px-3 py-2 rounded-md bg-red-700/10 border border-red-600/30 text-red-400 hover:bg-red-700/20 transition"
          >
            Delete all
          </button>
        </div>
      </div>
      <div className="grid gap-3">
      {shares.map((share, idx) => (
        <div
          key={share.id}
          className={`rounded-xl bg-gradient-to-br border p-4 hover:border-opacity-50 transition-all ${
            share.isText
              ? 'from-purple-800/30 to-pink-800/20 border-purple-500/30 hover:border-purple-500'
              : 'from-slate-800/50 to-slate-900/30 border-slate-700/50 hover:border-indigo-500'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-center justify-between gap-4">
            {/* Info */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                share.isText 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {share.isText ? <Type className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 truncate text-sm">{share.name}</p>
                <p className="text-xs text-slate-400 mt-1">ID: {share.id}</p>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
              share.expiresAt <= Date.now()
                ? 'bg-red-500/10 text-red-300'
                : 'bg-slate-800/50 text-amber-300'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{getTimeRemaining(share.expiresAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const base = (process.env.NEXT_PUBLIC_BASE_URL as string) || (typeof window !== 'undefined' ? window.location.origin : '')
                  copyToClipboard(`${base}/view/${share.id}#key=${share.key}`, share.id)
                }}
                className={`p-2 rounded-lg transition-all ${
                  copied === share.id
                    ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                }`}
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteShare(share.id)}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                title="Delete share"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  </div>
  )
}
