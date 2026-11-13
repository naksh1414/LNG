import { getBookById } from '@/lib/books/repo'
import { createEnquiry } from '@/lib/enquiries/repo'
import { enquirySchema } from '@/lib/enquiries/schema'
import { hit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/request'

const HOUR = 60 * 60 * 1000

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Check the form and try again.' }, { status: 400 })

  const { website, bookId, ...fields } = parsed.data
  // Bots get a fake success and do not spend the rate limit budget.
  if (website) return Response.json({ id: 'ok' }, { status: 201 })

  try {
    const { allowed } = await hit(`enquiry:${clientIp(request.headers)}`, 5, HOUR)
    if (!allowed) return Response.json({ error: 'Too many enquiries. Try again later.' }, { status: 429 })
  } catch {
    // Fail open: a limiter outage must not block real enquiries.
    console.error('enquiries: rate limit check failed, continuing')
  }

  try {
    // Unknown or malformed bookId is ignored; the title is a snapshot taken now.
    const book = bookId ? await getBookById(bookId) : null
    const enquiry = await createEnquiry({ ...fields, ...(book && { bookId: book.id, bookTitle: book.title }) })
    return Response.json({ id: enquiry.id }, { status: 201 })
  } catch {
    console.error('enquiries: save failed')
    return Response.json({ error: 'Could not save your enquiry' }, { status: 500 })
  }
}
