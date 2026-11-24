import { createHash } from 'node:crypto'

export type Device = 'mobile' | 'tablet' | 'desktop'

// The day is part of the input, so the same visitor hashes differently each UTC day.
export function visitorHash(ip: string, userAgent: string, day: string, secret: string): string {
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return createHash('sha256').update([secret, day, ip, userAgent].join('\n')).digest('hex')
}

// An empty user agent is treated as a bot.
export function isBot(userAgent: string): boolean {
  return !userAgent || /bot|crawl|spider|slurp|curl|wget|python|httpclient|headless|lighthouse|preview|monitor|facebookexternalhit/i.test(userAgent)
}

export function deviceType(userAgent: string): Device {
  if (/ipad|tablet/i.test(userAgent) || (/android/i.test(userAgent) && !/mobile/i.test(userAgent))) return 'tablet'
  return /mobi|iphone|android/i.test(userAgent) ? 'mobile' : 'desktop'
}
