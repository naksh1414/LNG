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
