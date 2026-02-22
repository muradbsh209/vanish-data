'use client'

import Link from 'next/link'
import { FileText, Type, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main>
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">VanishData</h1>
          </div>
          <p className="text-lg text-slate-400 mb-2">Encrypted, ephemeral sharing that vanishes without a trace</p>
          <p className="text-sm text-slate-500">Choose what you'd like to share</p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Share File */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/share-file">
              <div className="h-full rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-8 hover:border-indigo-500/50 transition-all cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Share Files</h2>
                    <p className="text-sm text-slate-400">Upload and share any file type. Encrypt before upload, auto-delete with timer.</p>
                  </div>
                  <div className="mt-4 px-6 py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white font-medium rounded-lg transition-all">
                    Upload File
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Share Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/share-text">
              <div className="h-full rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all cursor-pointer group">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                    <Type className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Share Text</h2>
                    <p className="text-sm text-slate-400">Share messages, code, notes. End-to-end encrypted and auto-destruct.</p>
                  </div>
                  <div className="mt-4 px-6 py-2 bg-purple-600 group-hover:bg-purple-500 text-white font-medium rounded-lg transition-all">
                    Share Text
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-medium rounded-lg transition-all"
          >
            <FileText className="w-4 h-4" />
            View All Shares
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
