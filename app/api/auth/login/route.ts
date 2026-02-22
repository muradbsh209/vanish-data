import { NextResponse } from 'next/server'
import { verifyUser } from '../../../../lib/users'
import { createSession } from '../../../../lib/sessions'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const user = verifyUser(email, password)
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const token = createSession(user.id)
    return NextResponse.json({ user, token })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 400 })
  }
}
