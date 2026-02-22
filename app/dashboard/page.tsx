"use client"

import React from 'react'
import Link from 'next/link'
import { FilesList } from '../../components/FilesList'
import { Home, Lock } from 'lucide-react'
import RequireAuth from '../../components/RequireAuth'

export default function Dashboard() {
  return (
    <RequireAuth>
      <main>
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
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
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">File Manager</h1>
                </div>
                <div style={{ width: 64 }} />
              </div>
              <p className="text-slate-400">View all your shared files and text. Copy links anytime, delete whenever you want.</p>
            </div>

          {/* Files List */}
          <FilesList />
        </div>
      </main>
    </RequireAuth>
  )
}
