// @vitest-environment node
import { SignJWT } from 'jose'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createSessionToken, readSessionToken, SESSION_COOKIE } from './session'

const SECRET = 'test-secret-that-is-at-least-32-characters-long'

beforeAll(() => {
  process.env.SESSION_SECRET = SECRET
})

afterEach(() => {
  vi.useRealTimers()
  process.env.SESSION_SECRET = SECRET
})

describe('session', () => {
  it('session round trip returns the admin id', async () => {
    expect(SESSION_COOKIE).toBe('lng_admin')
    const token = await createSessionToken('abc123')
    expect(await readSessionToken(token)).toEqual({ adminId: 'abc123' })
  })

  it('readSessionToken returns null for a tampered token, an expired token and undefined', async () => {
    const token = await createSessionToken('abc123')
    const [h, p, s] = token.split('.')
    const forgedPayload = Buffer.from(JSON.stringify({ sub: 'evil', exp: 9999999999 })).toString('base64url')
    expect(await readSessionToken(`${h}.${forgedPayload}.${s}`)).toBeNull()
    expect(await readSessionToken(`${h}.${p}.${s.slice(0, -2)}xx`)).toBeNull()
    expect(await readSessionToken('garbage')).toBeNull()
    expect(await readSessionToken(undefined)).toBeNull()
    expect(await readSessionToken('')).toBeNull()

    // Signed with another secret.
    const other = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('abc123').setExpirationTime('1h')
      .sign(new TextEncoder().encode('another-secret-that-is-also-32-chars-long'))
    expect(await readSessionToken(other)).toBeNull()

    // alg none is never accepted.
    const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"sub":"abc123"}').toString('base64url')}.`
    expect(await readSessionToken(none)).toBeNull()

    // Expires after 7 days.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const fresh = await createSessionToken('abc123')
    vi.setSystemTime(new Date('2026-01-07T23:59:00Z'))
    expect(await readSessionToken(fresh)).toEqual({ adminId: 'abc123' })
    vi.setSystemTime(new Date('2026-01-08T00:01:00Z'))
    expect(await readSessionToken(fresh)).toBeNull()
  })

  it('fails loudly when SESSION_SECRET is missing or short', async () => {
    delete process.env.SESSION_SECRET
    await expect(createSessionToken('a')).rejects.toThrow('SESSION_SECRET is not set')
    await expect(readSessionToken('x.y.z')).rejects.toThrow('SESSION_SECRET is not set')
    process.env.SESSION_SECRET = 'short'
    await expect(createSessionToken('a')).rejects.toThrow(/at least 32/)
  })
})
