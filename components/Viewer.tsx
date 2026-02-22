"use client"

import React, { useEffect, useState, useRef } from 'react'
import CryptoJS from 'crypto-js'
import { motion } from 'framer-motion'
import { Copy, Flame, Lock, Clock, Download, Home } from 'lucide-react'
import Link from 'next/link'

function TextContent({ dataUrl }: { dataUrl: string }) {
  const [text, setText] = useState('')
  
  useEffect(() => {
    if (!dataUrl) return
    try {
      const base64 = dataUrl.split(',')[1]
      if (base64) {
        const decoded = atob(base64)
        setText(decoded)
      }
    } catch (e) {
      setText('Unable to decode text content')
    }
  }, [dataUrl])
  
  return <>{text}</>;
}

export default function Viewer({ id }: { id: string }) {
  const [encrypted, setEncrypted] = useState<string | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [decryptedText, setDecryptedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [blurred, setBlurred] = useState(false)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)
  const [isText, setIsText] = useState(false)
  const [watermark, setWatermark] = useState<string | null>(null)
  const [viewOnce, setViewOnce] = useState(true)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [destroyed, setDestroyed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(()=>{
    fetch(`/api/files?id=${id}`).then(r=>{
      if (!r.ok) {
        return r.json().then(d => {
          throw new Error(d?.error || 'Failed to fetch file')
        })
      }
      return r.json()
    }).then(d=>{
      if(d?.encrypted) {
        setEncrypted(d.encrypted)
        if(d.expiresAt) setExpiresAt(Number(d.expiresAt))
        if(d.name) setName(d.name)
        if(d.mimeType) setMimeType(d.mimeType)
        setViewOnce(d.viewOnce || false)
        setIsText(d.isText || false)
        if(d.createdAt && d.ip) {
          setWatermark(`IP: ${d.ip} | ${new Date(d.createdAt).toLocaleString()}`)
        }
      }
      else throw new Error('Invalid file data')
    }).catch(e=>{
      console.error('Viewer fetch error:', e)
      setError(e.message || 'File not found or expired')
    })
  },[id])

  useEffect(()=>{
    function onBlur(){ setBlurred(true) }
    function onFocus(){ setBlurred(false) }
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return ()=>{ window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus) }
  },[])

  useEffect(()=>{
    const h = window.location.hash || ''
    const keyMatch = h.match(/key=([^&]+)/)
    const key = keyMatch?.[1]
    if(!key) {
      setError('No key in URL fragment. The secret key must follow the # so it is never sent to the server.')
      return
    }
    if(!encrypted) return
    try{
      const bytes = CryptoJS.AES.decrypt(encrypted, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      if(!decrypted) throw new Error('Decryption failed')
      
      if(isText) {
        // For text shares, store the plain text directly
        setDecryptedText(decrypted)
      } else {
        // For file shares, the decrypted data is a data URL
        setDataUrl(decrypted)
      }
      
      if(expiresAt) {
        const rem = Math.max(0, Math.floor((Number(expiresAt) - Date.now())/1000))
        setRemaining(rem)
      }
      
      // Generate watermark SVG from stored watermark string
      if(watermark && !watermark.startsWith('url(')) {
        const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><text x='0' y='20' fill='rgba(255,255,255,0.04)' font-size='18' font-family='monospace'>${watermark}</text></svg>`)
        setWatermark(`url("data:image/svg+xml;utf8,${svg}")`)
      }
    }catch(e){
      setError('Unable to decrypt. Is the key correct?')
    }
  },[encrypted, expiresAt, isText])

  useEffect(()=>{
    if(remaining === null) return
    if(remaining <= 0) {
      // Only auto-burn if viewOnce is true, otherwise just stop the timer
      if(viewOnce) {
        burn()
        try { window.close() } catch(e) { window.location.href = '/' }
      }
      return
    }
    const it = setInterval(()=>{
      setRemaining(r => {
        if(r === null) return null
        if(r <= 1) {
          clearInterval(it)
          // Only auto-burn if viewOnce is true
          if(viewOnce) {
            burn()
            try { window.close() } catch(e) { window.location.href = '/' }
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return ()=> clearInterval(it)
  },[remaining, viewOnce])

  useEffect(()=>{
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current
      if(!el) return
      const r = el.getBoundingClientRect()
      const mx = ((e.clientX - r.left)/r.width)*100
      const my = ((e.clientY - r.top)/r.height)*100
      el.style.setProperty('--mx', mx + '%')
      el.style.setProperty('--my', my + '%')
    }
    window.addEventListener('mousemove', onMove)
    return ()=> window.removeEventListener('mousemove', onMove)
  },[])

  function preventDownload(e: React.MouseEvent | React.DragEvent) {
    e.preventDefault()
    return false
  }

  async function burn() {
    setDestroyed(true)
    await fetch('/api/files', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
  }

  function copyUrl() {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if(error) {
    return (
      <main>
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30 p-8 text-center">
              <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-300">{error}</p>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
                  <Home className="w-5 h-5" />
                  Home
                </Link>
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <Lock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Secure Viewer</h1>
                </div>
                <div style={{ width: 64 }} />
              </div>
              {name && (
                <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {name}
                </p>
              )}
            </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          ref={wrapRef}
        >
          <div 
            className="viewer-wrap relative rounded-2xl overflow-hidden min-h-[500px] bg-black border border-slate-700 flex items-center justify-center mb-6 group"
            onContextMenu={preventDownload}
          >
            {watermark && <div className="watermark absolute inset-0" style={{backgroundImage: watermark, opacity: 0.5}} />}

            {!dataUrl && !decryptedText && (
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-12 h-12 border-2 border-indigo-500 border-t-purple-500 rounded-full mx-auto mb-4" />
                </motion.div>
                <p className="text-slate-300 font-medium">Decrypting your {isText ? 'message' : 'file'}…</p>
              </div>
            )}

            {(dataUrl || decryptedText) && !destroyed && (
              <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
                <motion.div 
                  initial={{opacity:0, scale:0.95}} 
                  animate={{opacity: 1, scale:1}} 
                  transition={{duration:0.45}}
                >
                  <div className="max-w-full max-h-full">
                    {/* Text shares */}
                    {isText && decryptedText && (
                      <div className="w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-lg p-6 max-h-[600px] overflow-auto">
                        <pre className="text-base text-slate-100 font-mono whitespace-pre-wrap break-words leading-relaxed">
                          {decryptedText}
                        </pre>
                      </div>
                    )}
                    
                    {/* Images */}
                    {!isText && dataUrl && mimeType?.startsWith('image/') && (
                      <img 
                        src={dataUrl} 
                        alt="Decrypted" 
                        className="max-w-full max-h-[600px] object-contain rounded-lg" 
                        onContextMenu={preventDownload}
                        onDragStart={preventDownload}
                        draggable={false}
                      />
                    )}
                    {/* PDFs */}
                    {!isText && dataUrl && mimeType?.startsWith('application/pdf') && (
                      <object data={dataUrl} type="application/pdf" width="100%" height="600" className="rounded-lg">PDF preview</object>
                    )}
                    {/* Videos */}
                    {!isText && dataUrl && mimeType?.startsWith('video/') && (
                      <video 
                        controls
                        className="max-w-full max-h-[600px] rounded-lg" 
                        style={{maxWidth: '100%', maxHeight: '600px'}}
                        onContextMenu={preventDownload}
                        controlsList="nodownload"
                        preload="metadata"
                      >
                        <source src={dataUrl} type={mimeType} />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {/* Audio */}
                    {!isText && dataUrl && mimeType?.startsWith('audio/') && (
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3H2c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm8-4h-3v3h-2v-3H7V9h3V6h2v3h3v2z" />
                          </svg>
                        </div>
                        <audio 
                          controls
                          className="w-full max-w-md"
                          onContextMenu={preventDownload}
                          controlsList="nodownload"
                          preload="metadata"
                        >
                          <source src={dataUrl} type={mimeType} />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    )}
                    {/* Text files */}
                    {!isText && dataUrl && (mimeType?.startsWith('text/') || ['application/json', 'application/xml', 'application/javascript'].includes(mimeType || '')) && (
                      <div className="w-full max-w-3xl bg-slate-800 border border-slate-700 rounded-lg p-4 max-h-[600px] overflow-auto">
                        <pre className="text-sm text-slate-100 font-mono whitespace-pre-wrap break-words">
                          <TextContent dataUrl={dataUrl} />
                        </pre>
                      </div>
                    )}
                    {/* Files that can't be displayed */}
                    {!isText && dataUrl &&
                     !mimeType?.startsWith('image/') && 
                     !mimeType?.startsWith('video/') && 
                     !mimeType?.startsWith('audio/') && 
                     !mimeType?.startsWith('text/') &&
                     !mimeType?.startsWith('application/pdf') &&
                     !mimeType?.includes('word') &&
                     !mimeType?.includes('officedocument') &&
                     !['application/json', 'application/xml', 'application/javascript'].includes(mimeType || '') && (
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-slate-300 font-semibold mb-4">{name || 'File'}</p>
                        <p className="text-slate-400 text-sm mb-6">Click the button below to download this file.</p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = dataUrl
                            link.download = name || 'download'
                            link.click()
                          }}
                          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all"
                        >
                          Download File
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {blurred && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-red-500/20 border-2 border-yellow-500/50 flex items-center justify-center backdrop-blur-sm z-20">
                  <div className="text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <p className="text-white font-semibold text-lg">Window lost focus</p>
                    <p className="text-yellow-200 text-sm mt-2">Click back in the window to continue viewing</p>
                  </div>
                </div>
              </motion.div>
            )}

            {destroyed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center z-20">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Flame className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-2xl font-bold text-white mb-2">Self-Destructed</p>
                    <p className="text-slate-300">This document has been permanently deleted.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Controls Footer */}
        {(dataUrl || decryptedText) && !destroyed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-3 gap-4">
            {/* Timer */}
            {remaining !== null && (
              <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-semibold text-slate-400">Time Remaining</p>
                </div>
                <p className={`text-2xl font-bold font-mono ${remaining > 60 ? 'text-amber-300' : remaining > 10 ? 'text-orange-300' : 'text-red-400'}`}>
                  {Math.floor((remaining||0)/60)}:{String((remaining||0)%60).padStart(2,'0')}
                </p>
              </div>
            )}

            {/* Copy URL */}
            <button
              onClick={copyUrl}
              className={`rounded-xl font-medium transition-all p-4 border flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-300'
              }`}
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {/* Burn Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={burn}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium p-4 border border-red-500/30 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all flex items-center justify-center gap-2 w-full"
              >
                <Flame className="w-4 h-4" />
                Self-Destruct
              </button>
            </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
