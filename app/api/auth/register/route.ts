import { NextResponse } from 'next/server'
import { createUser } from '../../../../lib/users'
import { createSession } from '../../../../lib/sessions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, planName = 'Free', role = 'free', teamSize } = body
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const user = createUser(email, password, role, planName, teamSize)
    const token = createSession(user.id)
    return NextResponse.json({ user, token }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 400 })
  }
}
