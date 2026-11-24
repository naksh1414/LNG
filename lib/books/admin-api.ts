import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { bookInputSchema, type BookInput } from './types'

// Shared by the admin book routes: parse a JSON body into a BookInput or a 400 with per-field messages.
export async function parseBookBody(request: Request): Promise<BookInput | Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = bookInputSchema.safeParse(body)
  if (parsed.success) return parsed.data
  const fields = Object.fromEntries(
    Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, (v as string[])[0]]),
  )
  return Response.json({ error: 'Check the highlighted fields.', fields }, { status: 400 })
}

export const isDuplicateSlug = (e: unknown) =>
  (e as { code?: number }).code === 11000 && String((e as Error).message).includes('slug')

export const slugTaken = () =>
  Response.json(
    { error: 'Check the highlighted fields.', fields: { slug: 'Another book already uses this slug. Choose a different one.' } },
    { status: 409 },
  )

export const forbidden = () => Response.json({ error: 'Cross-origin request refused.' }, { status: 403 })

export const serverError = (what: string, err: unknown) => {
  console.error(`admin books: ${what} failed:`, err instanceof Error ? err.message : 'unknown error')
  return Response.json({ error: 'Could not save. Try again shortly.' }, { status: 500 })
}

// Public pages that list or show books.
export function revalidateBooks() {
  revalidatePath('/')
  revalidatePath('/catalog')
  revalidatePath('/books/[slug]', 'page')
}
