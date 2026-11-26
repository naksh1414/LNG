import { audit } from '@/lib/audit/log'
import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, isDuplicateSlug, parseBookBody, revalidateBooks, serverError, slugTaken } from '@/lib/books/admin-api'
import { deleteBook, getBookById, updateBook } from '@/lib/books/repo'
import { isCrossOrigin } from '@/lib/request'

type Ctx = { params: Promise<{ id: string }> }
const notFound = () => Response.json({ error: 'Book not found.' }, { status: 404 })

export async function PATCH(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'catalog', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const input = await parseBookBody(request)
  if (input instanceof Response) return input
  try {
    const book = await updateBook((await params).id, input)
    if (!book) return notFound()
    await audit(request, auth, 'book_updated', { type: 'book', id: book.id, label: `${book.title} (${book.series})` })
    revalidateBooks()
    return Response.json({ book })
  } catch (err) {
    if (isDuplicateSlug(err)) return slugTaken()
    return serverError('update', err)
  }
}

// Enquiries and events keep a title snapshot, so they stay readable after the book is gone.
export async function DELETE(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'catalog', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  try {
    const { id } = await params
    const book = await getBookById(id)
    if (!(await deleteBook(id))) return notFound()
    await audit(request, auth, 'book_deleted', { type: 'book', id, label: book ? `${book.title} (${book.series})` : undefined })
    revalidateBooks()
    return Response.json({ ok: true })
  } catch (err) {
    return serverError('delete', err)
  }
}
