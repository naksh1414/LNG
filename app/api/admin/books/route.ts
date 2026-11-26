import { audit } from '@/lib/audit/log'
import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, parseBookBody, revalidateBooks, serverError } from '@/lib/books/admin-api'
import { createBook, listAllBooks } from '@/lib/books/repo'
import { isCrossOrigin } from '@/lib/request'

export async function GET(request: Request): Promise<Response> {
  const auth = await requireAdmin(request, 'catalog')
  if (auth instanceof Response) return auth
  try {
    return Response.json({ books: await listAllBooks() })
  } catch (err) {
    return serverError('list', err)
  }
}

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request, 'catalog', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const input = await parseBookBody(request)
  if (input instanceof Response) return input
  try {
    // createBook retries on a duplicate slug and suffixes it (-2, -3), so no 409 here.
    const book = await createBook(input)
    await audit(request, auth, 'book_created', { type: 'book', id: book.id, label: `${book.title} (${book.series})` })
    revalidateBooks()
    return Response.json({ book }, { status: 201 })
  } catch (err) {
    return serverError('create', err)
  }
}
