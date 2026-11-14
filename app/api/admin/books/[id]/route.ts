import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, isDuplicateSlug, parseBookBody, revalidateBooks, serverError, slugTaken } from '@/lib/books/admin-api'
import { deleteBook, updateBook } from '@/lib/books/repo'
import { isCrossOrigin } from '@/lib/request'

type Ctx = { params: Promise<{ id: string }> }
const notFound = () => Response.json({ error: 'Book not found.' }, { status: 404 })

export async function PATCH(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const input = await parseBookBody(request)
  if (input instanceof Response) return input
  try {
    const book = await updateBook((await params).id, input)
    if (!book) return notFound()
    revalidateBooks()
    return Response.json({ book })
  } catch (err) {
    if (isDuplicateSlug(err)) return slugTaken()
    return serverError('update', err)
  }
}

// Enquiries and events keep a title snapshot, so they stay readable after the book is gone.
export async function DELETE(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  try {
    if (!(await deleteBook((await params).id))) return notFound()
    revalidateBooks()
    return Response.json({ ok: true })
  } catch (err) {
    return serverError('delete', err)
  }
}
