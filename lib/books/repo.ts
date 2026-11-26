import { ObjectId, type Filter, type WithId } from 'mongodb'
import { getDb } from '@/lib/db/mongo'
import { slugify, uniqueSlug } from './format'
import type { Book, BookInput } from './types'

type BookDoc = Omit<Book, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: Date; updatedAt: Date }

async function books() {
  return (await getDb()).collection<BookDoc>('books')
}

function toBook({ _id, createdAt, updatedAt, ...rest }: WithId<BookDoc>): Book {
  // Books saved before series and classes existed have neither; the hierarchy files them under fallbacks.
  return { ...rest, series: rest.series ?? '', classLevel: rest.classLevel ?? '', id: _id.toHexString(), createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() }
}

const oid = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null)

async function list(filter: { published?: true }): Promise<Book[]> {
  return (await (await books()).find(filter).sort({ createdAt: 1, _id: 1 }).toArray()).map(toBook)
}

export const listPublishedBooks = () => list({ published: true })
export const listAllBooks = () => list({})

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// One page of published books. Filtering, counting and paging happen in the database, so the browser
// never receives more than a page. shortcut: a case-insensitive regex scan, fine for hundreds of books;
// add a text index if the catalogue grows to many thousands.
export async function searchPublishedBooks(opts: { subject?: string; q?: string; page: number; pageSize: number }): Promise<{ books: Book[]; total: number }> {
  const c = await books()
  const filter: Filter<BookDoc> = { published: true }
  if (opts.subject) filter.subject = opts.subject
  if (opts.q) {
    const rx = new RegExp(escapeRegex(opts.q), 'i')
    filter.$or = [{ title: rx }, { author: rx }, { subject: rx }]
  }
  const [docs, total] = await Promise.all([
    c.find(filter).sort({ createdAt: 1, _id: 1 }).skip((opts.page - 1) * opts.pageSize).limit(opts.pageSize).toArray(),
    c.countDocuments(filter),
  ])
  return { books: docs.map(toBook), total }
}

export async function getPublishedBookBySlug(slug: string): Promise<Book | null> {
  const doc = await (await books()).findOne({ slug, published: true })
  return doc && toBook(doc)
}

export async function getBookById(id: string): Promise<Book | null> {
  const _id = oid(id)
  const doc = _id && (await (await books()).findOne({ _id }))
  return doc ? toBook(doc) : null
}

const MAX_ATTEMPTS = 5

// Non-ASCII titles slugify to a generic slug ("book"); the admin can set a slug manually.
export async function createBook(input: BookInput): Promise<Book> {
  const col = await books()
  const base = slugify(input.slug?.trim() || input.title)
  const now = new Date()
  for (let attempt = 1; ; attempt++) {
    const slug = await uniqueSlug(base, async (s) => (await col.findOne({ slug: s }, { projection: { _id: 1 } })) !== null)
    const doc: BookDoc = { ...input, slug, createdAt: now, updatedAt: now }
    try {
      const { insertedId } = await col.insertOne(doc as never)
      return toBook({ ...doc, _id: insertedId })
    } catch (e) {
      // uniqueSlug is check-then-act: a concurrent insert can win the slug, so retry.
      const dup = (e as { code?: number }).code === 11000 && String((e as Error).message).includes('slug')
      if (!dup || attempt >= MAX_ATTEMPTS) throw e
    }
  }
}

export async function updateBook(id: string, input: BookInput): Promise<Book | null> {
  const _id = oid(id)
  if (!_id) return null
  const { slug, ...rest } = input
  const set = { ...rest, ...(slug?.trim() ? { slug: slugify(slug) } : {}), updatedAt: new Date() }
  const doc = await (await books()).findOneAndUpdate({ _id }, { $set: set }, { returnDocument: 'after' })
  return doc && toBook(doc)
}

export async function deleteBook(id: string): Promise<boolean> {
  const _id = oid(id)
  if (!_id) return false
  return (await (await books()).deleteOne({ _id })).deletedCount === 1
}

export async function listSubjects(): Promise<string[]> {
  const subjects = await (await books()).distinct('subject', { published: true })
  return subjects.sort((a, b) => a.localeCompare(b))
}
