import { describe, expect, it } from 'vitest'
import { clientIp, isCrossOrigin } from './request'

const h = (init: Record<string, string>) => new Headers(init)

describe('clientIp', () => {
  it('prefers x-vercel-forwarded-for', () => {
    expect(clientIp(h({ 'x-vercel-forwarded-for': '1.1.1.1', 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '3.3.3.3' }))).toBe('1.1.1.1')
  })

  it('then x-real-ip', () => {
    expect(clientIp(h({ 'x-real-ip': '2.2.2.2', 'x-forwarded-for': '3.3.3.3' }))).toBe('2.2.2.2')
  })

  it('then the first x-forwarded-for entry', () => {
    expect(clientIp(h({ 'x-forwarded-for': ' 3.3.3.3 , 4.4.4.4' }))).toBe('3.3.3.3')
  })

  it('falls back to unknown', () => {
    expect(clientIp(h({}))).toBe('unknown')
    expect(clientIp(h({ 'x-forwarded-for': '' }))).toBe('unknown')
  })
})

describe('isCrossOrigin', () => {
  const req = (origin?: string) => new Request('https://lng.example/api/admin/books', { method: 'POST', headers: origin ? { origin } : {} })

  it('allows the same origin and a missing Origin', () => {
    expect(isCrossOrigin(req('https://lng.example'))).toBe(false)
    expect(isCrossOrigin(req())).toBe(false)
  })

  it('flags another origin and an opaque null origin', () => {
    expect(isCrossOrigin(req('https://evil.example'))).toBe(true)
    expect(isCrossOrigin(req('https://lng.example.evil.example'))).toBe(true)
    expect(isCrossOrigin(req('null'))).toBe(true)
  })
})
