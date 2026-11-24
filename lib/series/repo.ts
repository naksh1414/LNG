import { getDb } from '@/lib/db/mongo'
import { slugify } from '@/lib/books/format'
import { listAllBooks } from '@/lib/books/repo'
import type { Book } from '@/lib/books/types'

type SeriesDoc = { name: string; slug: string; description: string; logoUrl?: string | null; createdAt: Date }
export type AdminSeries = { name: string; slug: string; description: string; logoUrl: string | null; books: Book[] }

async function col() {
  return (await getDb()).collection<SeriesDoc>('series')
}

// Returns false when a series with the same slug already exists.
export async function createSeries(name: string, description: string, logoUrl: string | null = null): Promise<boolean> {
  const c = await col()
  const slug = slugify(name)
  if (await c.findOne({ slug }, { projection: { _id: 1 } })) return false
  await c.insertOne({ name, slug, description, logoUrl, createdAt: new Date() })
  return true
}

// Saved series plus any series name only used by books (added before series had their own list).
export async function listAdminSeries(): Promise<AdminSeries[]> {
  const [docs, books] = await Promise.all([(await col()).find().sort({ createdAt: 1 }).toArray(), listAllBooks()])
  const out = new Map<string, AdminSeries>()
  for (const d of docs) out.set(d.slug, { name: d.name, slug: d.slug, description: d.description, logoUrl: d.logoUrl ?? null, books: [] })
  for (const b of books) {
    const name = b.series.trim()
    if (!name) continue
    const slug = slugify(name)
    const s = out.get(slug) ?? { name, slug, description: '', logoUrl: null, books: [] }
    s.books.push(b)
    out.set(slug, s)
  }
  return [...out.values()]
}

// Series that only exist on books have no document yet, so this creates it on first use.
export async function setSeriesLogo(name: string, logoUrl: string | null): Promise<void> {
  const slug = slugify(name)
  await (await col()).updateOne(
    { slug },
    { $set: { logoUrl }, $setOnInsert: { name, slug, description: '', createdAt: new Date() } },
    { upsert: true },
  )
}

// slug -> logo URL, for the public catalogue.
export async function listSeriesLogos(): Promise<Record<string, string>> {
  const docs = await (await col()).find({ logoUrl: { $type: 'string' } }, { projection: { slug: 1, logoUrl: 1 } }).toArray()
  return Object.fromEntries(docs.map((d) => [d.slug, d.logoUrl as string]))
}
