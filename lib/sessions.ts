import crypto from 'crypto'
import { getUserById, User } from './users'

const sessions = new Map<string, string>() // token -> userId

export function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, userId)
  return token
}

export function getUserByToken(token?: string): User | null {
  if (!token) return null
  const userId = sessions.get(token)
  if (!userId) return null
  return getUserById(userId)
}

export function destroySession(token?: string) {
  if (!token) return
  sessions.delete(token)
}
