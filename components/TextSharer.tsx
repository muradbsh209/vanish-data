'use client'

import React, { useState, useRef } from 'react'
import CryptoJS from 'crypto-js'
import { Copy, Check, Lock, Zap, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TextSharer() {
  const [text, setText] = useState('')
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expires, setExpires] = useState<number>(3600)
  const [copied, setCopied] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })
  const [customMinutes, setCustomMinutes] = useState<string>('')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(60)
  const [viewOnce, setViewOnce] = useState(true)

  function genKey() {
    const arr = new Uint8Array(32)
    crypto.getRandomValues(arr)
    return Array.from(arr).map(b => ('0' + b.toString(16)).slice(-2)).join('').slice(0, 32)
  }

  function copyToClipboard() {
    if (link) {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleShare() {
    if (!text.trim()) {
      setNotification({ show: true, message: 'Please enter some text to share', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000)
      return
    }

    setLoading(true)
    try {
      const secretKey = genKey()
      const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString()
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      const expiresAt = Date.now() + expires * 1000

      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          encrypted,
          name: 'Shared Text',
          expiresAt,
          viewOnce,
          mimeType: 'text/plain',
          isText: true
        })
      })

      // Store in localStorage
      const storedShares = JSON.parse(localStorage.getItem('vanishdata_shares') || '[]')
      storedShares.push({
        id,
        name: 'Shared Text',
        expiresAt,
        createdAt: Date.now(),
        mimeType: 'text/plain',
        key: secretKey,
        isText: true
      })
      localStorage.setItem('vanishdata_shares', JSON.stringify(storedShares))

      // Show notification
      setNotification({ show: true, message: 'Text shared successfully! Check the dashboard for your link.', type: 'success' })
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)

      setText('')
    } catch (e) {
      console.error(e)
      setNotification({ show: true, message: 'Share failed. Please try again.', type: 'error' })
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
                <Home className="w-5 h-5" />
                Home
              </Link>
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">Share Text</h1>
              </div>
              <div style={{ width: 64 }} />
            </div>
            <p className="text-lg text-slate-400">Encrypted message sharing that auto-destructs</p>
          </motion.div>
        </div>

        <div className="grid gap-6">
          {/* Text Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 p-6 space-y-4">
              <label className="block">
                <p className="text-sm font-semibold text-slate-300 mb-3">Your Message</p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your secret message, code, or note..."
                  className="w-full h-64 bg-slate-700/50 border border-slate-600 text-slate-100 p-4 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500 font-mono text-sm resize-none"
                />
              </label>

              <div className="text-xs text-slate-400">
                {text.length} characters
              </div>
            </div>
          </motion.div>

          {/* Settings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <label className="text-sm font-semibold text-slate-300">Auto-Delete (minutes)</label>
                  <span className="text-xs text-amber-300 font-medium ml-auto">{Math.floor(expires / 60)}m</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 flex-wrap">
                    {[5, 15, 30, 60].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setExpires(m * 60)
                          setCustomMinutes('')
                          setSelectedPreset(m)
                        }}
                        className={`flex-1 min-w-12 py-2 px-3 text-sm rounded-lg transition-all font-medium ${selectedPreset === m
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-500 text-white'
                            : 'bg-slate-700/30 border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                          }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      min="1"
                      max="1440"
                      placeholder="Custom minutes"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 bg-slate-700/50 border border-slate-600 text-sm p-2.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => {
                        const m = Number(customMinutes)
                        if (m && m > 0 && m <= 1440) {
                          setExpires(m * 60)
                          setCustomMinutes('')
                          setSelectedPreset(null)
                        } else {
                          alert('Please enter a value between 1 and 1440 minutes')
                        }
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border border-purple-500/50 text-white font-medium rounded-lg transition-all whitespace-nowrap"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>

              {/* View Once */}
              <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-300">View Once</p>
                    <p className="text-xs text-slate-500">Self-destruct after viewing</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setViewOnce(!viewOnce)
                  }}
                  className={`relative w-14 h-7 rounded-full transition-all flex items-center ${viewOnce ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-600'
                    }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: viewOnce ? 30 : 3 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                  </motion.div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={handleShare}
              disabled={loading || !text.trim()}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${loading || !text.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                }`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  </motion.div>
                  Encrypting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Share Text Securely
                </>
              )}
            </button>
          </motion.div>

          {/* Notification Toast */}
          {notification.show && (
            <div className={`rounded-xl p-4 flex items-center gap-3 ${notification.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-100'
                : 'bg-red-500/20 border border-red-500/50 text-red-100'
              }`}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="font-medium">{notification.message}</p>
              </motion.div>
              {notification.type === 'success' && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
