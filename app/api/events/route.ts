import { getBookById, getPublishedBookBySlug } from '@/lib/books/repo'
import { recordEvent } from '@/lib/events/repo'
import { eventSchema } from '@/lib/events/schema'
import { deviceType, isBot, visitorHash } from '@/lib/events/visitor'
import { hit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/request'

const MINUTE = 60 * 1000

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid event.' }, { status: 400 })

  const ua = request.headers.get('user-agent') ?? ''
  if (isBot(ua)) return new Response(null, { status: 204 })

  const ip = clientIp(request.headers)
  try {
    const { allowed } = await hit(`event:${ip}`, 120, MINUTE)
    if (!allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })
  } catch {
    // Fail open: a limiter outage must not drop analytics.
    console.error('events: rate limit check failed, continuing')
  }

  try {
    const e = parsed.data
    const book =
      e.type === 'book_view'
        ? e.bookId
          ? await getBookById(e.bookId)
          : await getPublishedBookBySlug(decodeURIComponent(e.path.split('/')[2] ?? ''))
        : e.type === 'enquiry_sent' && e.bookId
          ? await getBookById(e.bookId)
          : null
    await recordEvent({
      type: e.type,
      ...('path' in e && { path: e.path }),
      ...('term' in e && { term: e.term }),
      ...(book && { bookId: book.id, bookTitle: book.title }),
      visitorHash: visitorHash(ip, ua, new Date().toISOString().slice(0, 10), process.env.SESSION_SECRET ?? ''),
      device: deviceType(ua),
    })
    return new Response(null, { status: 204 })
  } catch (err) {
    // Log the message (covers a missing SESSION_SECRET); never leak it to the client.
    console.error('events: could not record event:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ error: 'Could not record event.' }, { status: 500 })
  }
}
