import crypto from 'crypto'

type Role = 'free' | 'pro' | 'business' | 'enterprise'

export interface User {
  id: string
  email: string
  role: Role
  planName: string
  teamSize?: number
  createdAt: string
}

type StoredUser = User & { passwordHash: string }

const users = new Map<string, StoredUser>()

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function findUserByEmail(email: string): User | null {
  for (const u of users.values()) {
    if (u.email === email) return { ...u }
  }
  return null
}

export function createUser(email: string, password: string, role: Role = 'free', planName = 'Free', teamSize?: number) {
  if (findUserByEmail(email)) throw new Error('User exists')
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const stored: StoredUser = {
    id,
    email,
    role,
    planName,
    teamSize,
    createdAt: now,
    passwordHash: hashPassword(password),
  }
  users.set(id, stored)
  const { passwordHash, ...publicUser } = stored as any
  return publicUser as User
}

export function verifyUser(email: string, password: string): User | null {
  const hash = hashPassword(password)
  for (const u of users.values()) {
    if (u.email === email && u.passwordHash === hash) {
      const { passwordHash, ...publicUser } = u as any
      return publicUser as User
    }
  }
  return null
}

export function getUserById(id: string): User | null {
  const u = users.get(id)
  if (!u) return null
  const { passwordHash, ...publicUser } = u as any
  return publicUser as User
}
