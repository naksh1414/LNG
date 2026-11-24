import type { Metadata } from 'next'
import Link from 'next/link'
import { SeriesForm } from '@/components/admin/series-form'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { listAdminSeries } from '@/lib/series/repo'

export const metadata: Metadata = { title: 'Series' }
export const dynamic = 'force-dynamic'

export default async function AdminSeriesPage() {
  await requireAdminPage()
  const series = await listAdminSeries()
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Series</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">Create a series, then open it to add its books.</p>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="grid gap-3">
          {series.length === 0 && <li className="text-muted-foreground">No series yet. Add one to get started.</li>}
          {series.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/admin/series/${s.slug}`}
                className="block rounded-lg border border-border bg-background p-5 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {s.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                  <img src={s.logoUrl} alt="" className="mb-3 h-10 w-auto max-w-40 object-contain" />
                )}
                <span className="block text-lg font-bold">{s.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {s.books.length} {s.books.length === 1 ? 'book' : 'books'}
                  {s.description ? `. ${s.description}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <SeriesForm />
      </div>
    </>
  )
}
