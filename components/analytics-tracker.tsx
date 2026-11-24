'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

type Payload = { type: 'page_view' | 'book_view'; path: string } | { type: 'search'; term: string } | { type: 'enquiry_sent'; bookId?: string }

const isAdmin = (p: string) => p === '/admin' || p.startsWith('/admin/')

export function sendEvent(payload: Payload): void {
  try {
    if (navigator.doNotTrack === '1' || isAdmin(window.location.pathname)) return
    const json = JSON.stringify(payload)
    if (navigator.sendBeacon?.('/api/events', new Blob([json], { type: 'application/json' }))) return
    void fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: json, keepalive: true }).catch(() => {})
  } catch {
    // Tracking must never break the page.
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined

// Debounced so typing a term sends one event, not one per keystroke.
export function trackSearch(term: string): void {
  clearTimeout(searchTimer)
  const t = term.trim().slice(0, 80)
  if (t) searchTimer = setTimeout(() => sendEvent({ type: 'search', term: t }), 800)
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (isAdmin(pathname)) return
    sendEvent({ type: 'page_view', path: pathname })
    if (/^\/books\/[^/]+$/.test(pathname)) sendEvent({ type: 'book_view', path: pathname })
  }, [pathname])
  return null
}
