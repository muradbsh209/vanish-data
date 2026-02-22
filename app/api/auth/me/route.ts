import { NextResponse } from 'next/server'
import { getUserByToken } from '../../../../lib/sessions'

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined
    const user = getUserByToken(token)
    if (!user) return NextResponse.json({ user: null }, { status: 200 })
    return NextResponse.json({ user }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
