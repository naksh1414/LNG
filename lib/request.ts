// Prefer headers the platform sets itself; x-forwarded-for can carry client-supplied entries.
export function clientIp(headers: Headers): string {
  const first = (v: string | null) => v?.split(',')[0]?.trim() || undefined
  return (
    first(headers.get('x-vercel-forwarded-for')) ??
    first(headers.get('x-real-ip')) ??
    first(headers.get('x-forwarded-for')) ??
    'unknown'
  )
}

// Defence in depth beside the SameSite=lax cookie: a browser always sends Origin on POST, PATCH and DELETE.
// A missing Origin (curl, server to server) is allowed; the session cookie still gates it.
export function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    // Behind a proxy or in a container, request.url carries the internal bind address, so prefer the host the client used.
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host
    return new URL(origin).host !== host
  } catch {
    return true
  }
}
