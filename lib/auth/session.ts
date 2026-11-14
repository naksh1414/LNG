import { jwtVerify, SignJWT } from 'jose'

// Imported by proxy.ts: keep this module free of bcrypt and Mongo.
export const SESSION_COOKIE = 'lng_admin'
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
} as const

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  if (secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters (openssl rand -base64 32)')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(adminId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey())
}

export async function readSessionToken(token: string | undefined): Promise<{ adminId: string } | null> {
  if (!token) return null
  // Outside the try: a missing secret must fail loudly, not look like a signed-out user.
  const key = secretKey()
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return typeof payload.sub === 'string' && payload.sub ? { adminId: payload.sub } : null
  } catch {
    return null
  }
}
