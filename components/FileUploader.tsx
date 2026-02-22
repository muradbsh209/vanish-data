"use client"

import React, { useState, useRef } from 'react'
import CryptoJS from 'crypto-js'
import { UploadCloud, Copy, Check, Lock, Zap, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function FileUploader() {
  const [drag, setDrag] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expires, setExpires] = useState<number>(3600)
  const [viewOnce, setViewOnce] = useState(true)
  const [copied, setCopied] = useState(false)
  const [notification, setNotification] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({ show: false, message: '', type: 'success' })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [customMinutes, setCustomMinutes] = useState<string>('')
  const [selectedPreset, setSelectedPreset] = useState<number | null>(60)

  function genKey() {
    const arr = new Uint8Array(32)
    crypto.getRandomValues(arr)
    return Array.from(arr).map(b => ('0' + b.toString(16)).slice(-2)).join('').slice(0,32)
  }

  async function handleFile(file: File) {
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string
        const secretKey = genKey()
        const encrypted = CryptoJS.AES.encrypt(dataUrl, secretKey).toString()
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
        const expiresAt = Date.now() + expires * 1000
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, encrypted, name: file.name, expiresAt, viewOnce, mimeType: file.type })
        })
        
        // Store in localStorage for dashboard
        const storedFiles = JSON.parse(localStorage.getItem('vanishdata_uploads') || '[]')
        storedFiles.push({
          id,
          name: file.name,
          expiresAt,
          createdAt: Date.now(),
          mimeType: file.type,
          key: secretKey
        })
        localStorage.setItem('vanishdata_uploads', JSON.stringify(storedFiles))
        
        // Show notification instead of link section
        setNotification({ show: true, message: `"${file.name}" uploaded successfully! Check the dashboard for your link.`, type: 'success' })
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
      } catch (e) {
        console.error(e)
        setNotification({ show: true, message: 'Upload failed. Please try again.', type: 'error' })
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 4000)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function copyToClipboard() {
    if (link) {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <Lock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">VanishData</h1>
                </div>
                <div style={{ width: 64 }} />
              </div>
              <p className="text-lg text-slate-400">Encrypted, ephemeral file sharing that vanishes without a trace</p>
            </motion.div>
          </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              onDragOver={(e)=>{e.preventDefault(); setDrag(true)}}
              onDragLeave={()=>setDrag(false)}
              onDrop={onDrop}
              className={`relative overflow-hidden rounded-2xl p-12 transition-all duration-300 cursor-pointer group ${
                drag 
                  ? 'border-2 border-indigo-400 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-lg shadow-indigo-500/20' 
                  : 'border-2 border-dashed border-slate-600 bg-gradient-to-br from-slate-800/30 to-slate-900/30 hover:border-indigo-400 hover:bg-slate-800/40'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all" />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="relative flex flex-col items-center gap-6">
                  <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all">
                    <UploadCloud className="w-10 h-10 text-indigo-400" />
                  </div>
                  
                  <div className="text-center">
                  <p className="text-xl font-semibold text-slate-100 mb-2">Drop your file here</p>
                  <p className="text-slate-400">or</p>
                </div>

                <button
                  onClick={()=>inputRef.current?.click()}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Select file
                </button>

                <input 
                  ref={inputRef} 
                  type="file" 
                  className="hidden" 
                  onChange={(e)=>{const f=e.target.files?.[0]; if(f) handleFile(f)}} 
                />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Settings Section */}
          {!link && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
              {/* Expiration */}
              <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <label className="text-sm font-semibold text-slate-300">Auto-Delete (minutes)</label>
                  <span className="text-xs text-amber-300 font-medium ml-auto">{Math.floor(expires/60)}m</span>
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
                        className={`flex-1 min-w-12 py-2 px-3 text-sm rounded-lg transition-all font-medium ${
                          selectedPreset === m
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-500 text-white'
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
                      onChange={(e)=>setCustomMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 bg-slate-700/50 border border-slate-600 text-sm p-2.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={()=>{
                        const m = Number(customMinutes)
                        if(m && m > 0 && m <= 1440) {
                          setExpires(m * 60)
                          setCustomMinutes('')
                          setSelectedPreset(null)
                        } else {
                          alert('Please enter a value between 1 and 1440 minutes')
                        }
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-500/50 text-white font-medium rounded-lg transition-all whitespace-nowrap"
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
                  className={`relative w-14 h-7 rounded-full transition-all flex items-center ${
                    viewOnce ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-600'
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
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center gap-3 p-6 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-purple-500 rounded-full" />
                </motion.div>
                <span className="text-slate-300 font-medium">Encrypting & uploading your file…</span>
              </motion.div>
            </div>
          )}

          {/* Share Link Section */}
          {link && (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-emerald-100">Share Link Ready</h3>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-slate-800/50 border border-slate-700 p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Your secure link</p>
                  <p className="text-sm font-mono text-slate-200 break-all leading-relaxed">{link}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: copied ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </motion.div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg bg-slate-800/30 p-3 text-center">
                  <p className="text-xs font-semibold text-slate-400">Expires in</p>
                  <p className="text-lg font-bold text-indigo-300 mt-1">{Math.floor(expires/60)}m</p>
                </div>
                <div className="rounded-lg bg-slate-800/30 p-3 text-center">
                  <p className="text-xs font-semibold text-slate-400">View Once</p>
                  <p className="text-lg font-bold text-emerald-300 mt-1">{viewOnce ? 'On' : 'Off'}</p>
                </div>
              </div>
            </motion.div>
            </div>
          )}

          {/* Notification Toast */}
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-xl p-4 flex items-center gap-3 ${
                notification.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-100'
                  : 'bg-red-500/20 border border-red-500/50 text-red-100'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium">{notification.message}</p>
              </div>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
