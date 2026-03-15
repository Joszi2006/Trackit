// Session config — single import for all API routes
// Routes never touch iron-session directly; they call getSession() here
import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  studentId?: string    // undefined = not logged in
  isLoggedIn?: boolean  // explicit flag for readable route guards
}

export const sessionOptions: SessionOptions = {
  cookieName: 'trackit_session',
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

/**
 * Returns the current session. Validates SESSION_SECRET at runtime (not build time).
 * Route guard pattern: if (!session.isLoggedIn || !session.studentId) return 401
 */
export async function getSession() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}
