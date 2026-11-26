import type { Metadata } from 'next'
import Link from 'next/link'
import { AreaChart, BarColumns, BarList, Donut } from '@/components/admin/charts'
import { listAudit } from '@/lib/audit/repo'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { can } from '@/lib/auth/roles'
import { getDashboard } from '@/lib/dashboard/repo'
import { getMetrics } from '@/lib/metrics/repo'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

const num = (n: number) => n.toLocaleString('en-IN')
const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

// Last 7 days against the 7 before, from the daily series.
function trend(daily: { views: number }[]): { now: number; change: number | null } {
  const sum = (rows: { views: number }[]) => rows.reduce((s, d) => s + d.views, 0)
  const now = sum(daily.slice(-7))
  const before = sum(daily.slice(-14, -7))
  return { now, change: before ? Math.round(((now - before) / before) * 100) : null }
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-border bg-field p-5 ${className}`}>
      <h2 className="mb-4 font-bold">{title}</h2>
      {children}
    </section>
  )
}

function Stat({ label, value, note, href }: { label: string; value: number; note?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-[-0.03em] tabular-nums">{num(value)}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </>
  )
  const box = 'rounded-lg border border-border bg-field p-5'
  return href ? (
    <Link href={href} className={`${box} block transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  )
}

export default async function AdminDashboardPage() {
  const me = await requireAdminPage()
  const canMetrics = can(me.permissions, 'metrics')
  const canEnquiries = can(me.permissions, 'enquiries')
  const canCatalog = can(me.permissions, 'catalog')
  const canTestimonials = can(me.permissions, 'testimonials')
  // Only what the role may see is fetched.
  const [m, d, activity] = await Promise.all([
    canMetrics ? getMetrics(30) : null,
    getDashboard(),
    can(me.permissions, 'audit') ? listAudit(1, 6).then((r) => r.entries) : Promise.resolve([]),
  ])
  const t = m ? trend(m.daily) : null
  const totalBooks = d.seriesBooks.reduce((s, x) => s + x.n, 0)
  const publishedBooks = d.seriesBooks.reduce((s, x) => s + x.published, 0)
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Dashboard</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Signed in as {me.email} ({me.roleName}).
        {m && ` Visitor numbers cover the last ${m.days} days; admin pages and bots are not counted.`}
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {m && t && (
          <>
            <Stat label="Visitors" value={m.visitors} />
            <Stat label="Page views" value={m.pageViews} note={t.change === null ? `${num(t.now)} in the last 7 days` : `${num(t.now)} this week, ${t.change >= 0 ? '+' : ''}${t.change}% on the week before`} />
            <Stat label="Book views" value={m.bookViews} />
          </>
        )}
        {canCatalog && <Stat label="Published books" value={publishedBooks} note={`${totalBooks} in total`} href="/admin/series" />}
        {canCatalog && <Stat label="Series" value={d.seriesBooks.length} href="/admin/series" />}
        {canTestimonials && <Stat label="Testimonials" value={d.testimonials.published} note={`${d.testimonials.total} in total`} href="/admin/testimonials" />}
        {canEnquiries && <Stat label="New enquiries" value={d.unreadEnquiries} href="/admin/enquiries" />}
      </div>

      {m && (
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <Card title="Page views per day" className="lg:col-span-2">
            <AreaChart label="Page views per day, last 30 days" unit="views" points={m.daily.map((x) => ({ day: x.day, value: x.views }))} />
          </Card>
          <Card title="Devices">
            {m.devices.length ? <Donut label="Visits by device" rows={m.devices} /> : <p className="text-sm text-muted-foreground">No visits yet.</p>}
          </Card>
        </div>
      )}

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {canCatalog && (
          <Card title="Books by series">
            <BarList rows={d.seriesBooks.map((s) => ({ label: s.label, n: s.n, note: `${s.published} of ${s.n} published` }))} empty="No books yet." />
          </Card>
        )}
        {m && (
          <>
            <Card title="Most viewed books">
              <BarList rows={m.topBooks} empty="No book views yet." />
            </Card>
            <Card title="Top searches">
              <BarList rows={m.topSearches} empty="No searches yet." />
            </Card>
          </>
        )}
      </div>

      {canEnquiries && (
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <Card title="Enquiries per day" className="lg:col-span-2">
            <BarColumns label="Enquiries per day, last 30 days" unit="enquiries" points={d.enquiriesDaily.map((x) => ({ day: x.day, value: x.n }))} />
          </Card>
          <Card title="Recent enquiries">
            {d.recentEnquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enquiries yet.</p>
            ) : (
              <ul className="grid gap-3 text-sm">
                {d.recentEnquiries.map((e) => (
                  <li key={e.id}>
                    <p className="flex items-center gap-2">
                      <span className="truncate font-semibold">{e.name}</span>
                      {!e.read && <span className="rounded-full bg-accent px-2 text-xs font-semibold text-accent-foreground">New</span>}
                    </p>
                    <p className="truncate text-muted-foreground">{e.message}</p>
                    <p className="text-xs text-muted-foreground">{when.format(new Date(e.createdAt))}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/enquiries" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent">
              All enquiries
            </Link>
          </Card>
        </div>
      )}

      {activity.length > 0 && (
        <div className="mt-6">
          <Card title="Recent activity">
            <ul className="grid gap-2 text-sm">
              {activity.map((a) => (
                <li key={a.seq} className="flex flex-wrap justify-between gap-x-4">
                  <span>
                    <span className="font-medium">{a.actorEmail}</span> <span className="text-muted-foreground">{a.action.replaceAll('_', ' ')}{a.targetLabel ? `, ${a.targetLabel}` : ''}</span>
                  </span>
                  <span className="text-muted-foreground">{when.format(a.at)}</span>
                </li>
              ))}
            </ul>
            <Link href="/admin/audit" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent">
              Full audit log
            </Link>
          </Card>
        </div>
      )}
    </>
  )
}
