import './globals.css'
import { AuthProvider } from '../components/AuthProvider'
import Link from 'next/link'

export const metadata = {
  title: 'VanishData',
  description: 'Secure ephemeral file sharing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f14] text-slate-100 antialiased">
        <AuthProvider>
          <header className="w-full border-b border-slate-800/50 py-3 mb-6">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg">VanishData</Link>
              <nav className="flex items-center gap-3">
                <Link href="/plans" className="text-slate-300 hover:text-white">Plans</Link>
                <Link href="/login" className="text-slate-300 hover:text-white">Sign in</Link>
                <Link href="/register" className="text-slate-300 hover:text-white">Sign up</Link>
              </nav>
            </div>
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
