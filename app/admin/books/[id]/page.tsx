import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookForm } from '@/components/admin/book-form'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { getBookById } from '@/lib/books/repo'
import { slugify } from '@/lib/books/format'

export const metadata: Metadata = { title: 'Edit book' }
export const dynamic = 'force-dynamic'

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage('catalog', 'write')
  const book = await getBookById((await params).id)
  if (!book) notFound()
  const back = book.series ? `/admin/series/${slugify(book.series)}` : '/admin/series'
  return (
    <>
      <Link
        href={back}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {book.series || 'All series'}
      </Link>
      <h1 className="mb-8 text-3xl font-extrabold tracking-[-0.03em] text-balance text-foreground">{book.title}</h1>
      <BookForm book={book} series={book.series || undefined} backHref={back} />
    </>
  )
}
