import { getBookById } from '@/lib/books/repo'
import { createEnquiry } from '@/lib/enquiries/repo'
import { enquirySchema } from '@/lib/enquiries/schema'
import { hit } from '@/lib/rate-limit'

const HOUR = 60 * 60 * 1000

export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = await hit(`enquiry:${ip}`, 5, HOUR)
  if (!allowed) return Response.json({ error: 'Too many enquiries. Try again later.' }, { status: 429 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Check the form and try again.' }, { status: 400 })

  const { website, bookId, ...fields } = parsed.data
  if (website) return Response.json({ id: 'ok' }, { status: 201 })

  // Unknown or malformed bookId is ignored; the title is a snapshot taken now.
  const book = bookId ? await getBookById(bookId) : null
  const enquiry = await createEnquiry({ ...fields, ...(book && { bookId: book.id, bookTitle: book.title }) })
  return Response.json({ id: enquiry.id }, { status: 201 })
}
