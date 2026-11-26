import type { Metadata } from 'next'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { getMetrics } from '@/lib/metrics/repo'

export const metadata: Metadata = { title: 'Metrics' }
export const dynamic = 'force-dynamic'

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-field p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-[-0.03em] tabular-nums">{value.toLocaleString('en-IN')}</p>
    </div>
  )
}

function Top({ title, rows, empty }: { title: string; rows: { label: string; n: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <section className="rounded-lg border border-border bg-field p-5">
      <h2 className="font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between gap-4 text-sm">
                <span className="truncate">{r.label}</span>
                <span className="tabular-nums text-muted-foreground">{r.n}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-border">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r.n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default async function AdminMetricsPage() {
  await requireAdminPage('metrics')
  const m = await getMetrics(30)
  const peak = Math.max(1, ...m.daily.map((d) => d.views))
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Metrics</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">Visitors and activity over the last {m.days} days. Admin pages and bots are not counted.</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Visitors" value={m.visitors} />
        <Stat label="Page views" value={m.pageViews} />
        <Stat label="Book views" value={m.bookViews} />
        <Stat label="Searches" value={m.searches} />
        <Stat label="Enquiries sent" value={m.enquiriesSent} />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-field p-5">
        <h2 className="font-bold">Page views per day</h2>
        <ol aria-label="Page views per day" className="mt-4 flex h-32 items-end gap-1">
          {m.daily.map((d) => (
            <li key={d.day} title={`${d.day}: ${d.views}`} className="flex h-full flex-1 items-end">
              <span className="block w-full rounded-t-sm bg-accent" style={{ height: `${Math.max(2, (d.views / peak) * 100)}%`, opacity: d.views ? 1 : 0.2 }} />
              <span className="sr-only">{d.day}: {d.views}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <Top title="Most viewed books" rows={m.topBooks} empty="No book views yet." />
        <Top title="Top searches" rows={m.topSearches} empty="No searches yet." />
        <Top title="Devices" rows={m.devices} empty="No visits yet." />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Books" value={m.books.total} />
        <Stat label="Published books" value={m.books.published} />
        <Stat label="Enquiries received" value={m.enquiriesTotal} />
      </div>
    </>
  )
}
