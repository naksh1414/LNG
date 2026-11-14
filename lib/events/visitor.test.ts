// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { deviceType, isBot, visitorHash } from './visitor'

const CHROME = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

describe('visitorHash', () => {
  it('is stable within a day and differs across days and user agents', () => {
    const a = visitorHash('1.1.1.1', 'ua', '2026-11-13', 's')
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(visitorHash('1.1.1.1', 'ua', '2026-11-13', 's')).toBe(a)
    expect(visitorHash('1.1.1.1', 'ua', '2026-11-14', 's')).not.toBe(a)
    expect(visitorHash('1.1.1.1', 'other', '2026-11-13', 's')).not.toBe(a)
    expect(visitorHash('1.1.1.2', 'ua', '2026-11-13', 's')).not.toBe(a)
  })
  it('throws a clear message without a secret', () => {
    expect(() => visitorHash('1.1.1.1', 'ua', '2026-11-13', '')).toThrow('SESSION_SECRET is not set')
  })
})

describe('isBot', () => {
  it('flags Googlebot and curl but not a Chrome UA', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true)
    expect(isBot('curl/8.4.0')).toBe(true)
    expect(isBot('')).toBe(true)
    expect(isBot(CHROME)).toBe(false)
  })
})

describe('deviceType', () => {
  it('detects mobile, tablet and desktop', () => {
    expect(deviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148')).toBe('mobile')
    expect(deviceType('Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36')).toBe('mobile')
    expect(deviceType('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('tablet')
    expect(deviceType('Mozilla/5.0 (Linux; Android 13; SM-X700) Safari/537.36')).toBe('tablet')
    expect(deviceType(CHROME)).toBe('desktop')
  })
})
