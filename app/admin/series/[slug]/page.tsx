import { ArrowLeft, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookTable } from '@/components/admin/book-table'
import { SeriesLogoEditor } from '@/components/admin/series-logo-editor'
import { buttonVariants } from '@/components/ui/button'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { listAdminSeries } from '@/lib/series/repo'

export const metadata: Metadata = { title: 'Series' }
export const dynamic = 'force-dynamic'

export default async function AdminSeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage()
  const { slug } = await params
  const series = (await listAdminSeries()).find((s) => s.slug === slug)
  if (!series) notFound()
  return (
    <>
      <Link
        href="/admin/series"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All series
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">{series.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {series.books.length} {series.books.length === 1 ? 'book' : 'books'}
            {series.description ? `. ${series.description}` : ''}
          </p>
        </div>
        <Link href={`/admin/series/${series.slug}/books/new`} className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Add book to this series
        </Link>
      </div>
      <SeriesLogoEditor slug={series.slug} logoUrl={series.logoUrl} />
      {series.books.length ? <BookTable books={series.books} /> : <p className="text-muted-foreground">No books in this series yet.</p>}
    </>
  )
}
