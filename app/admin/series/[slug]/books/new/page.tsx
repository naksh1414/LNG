import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookForm } from '@/components/admin/book-form'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { listAdminSeries } from '@/lib/series/repo'

export const metadata: Metadata = { title: 'Add book' }
export const dynamic = 'force-dynamic'

export default async function NewSeriesBookPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage('catalog', 'write')
  const { slug } = await params
  const series = (await listAdminSeries()).find((s) => s.slug === slug)
  if (!series) notFound()
  const back = `/admin/series/${series.slug}`
  return (
    <>
      <Link
        href={back}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {series.name}
      </Link>
      <h1 className="mb-8 text-3xl font-extrabold tracking-[-0.03em] text-foreground">Add book to {series.name}</h1>
      <BookForm series={series.name} backHref={back} />
    </>
  )
}
