import { ShieldAlert, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { listAudit, verifyAuditChain, type AuditAction } from '@/lib/audit/repo'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Audit log' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const labels: Record<AuditAction, string> = {
  login_success: 'Logged in',
  login_failed: 'Failed login',
  logout: 'Logged out',
  password_changed: 'Changed password',
  series_created: 'Added series',
  series_logo_changed: 'Changed series logo',
  book_created: 'Added book',
  book_updated: 'Edited book',
  book_deleted: 'Deleted book',
  testimonial_created: 'Added testimonial',
  testimonial_updated: 'Edited testimonial',
  testimonial_deleted: 'Deleted testimonial',
  user_created: 'Added admin user',
  user_updated: 'Changed admin user',
  user_password_reset: 'Reset a user password',
  user_deleted: 'Deleted admin user',
  role_created: 'Added role',
  role_updated: 'Changed role',
  role_deleted: 'Deleted role',
}

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Kolkata' })

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdminPage('audit')
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1)
  const [{ entries, total }, chain] = await Promise.all([listAudit(page, PAGE_SIZE), verifyAuditChain()])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Audit log</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Who logged in, and who added, edited or deleted what. Entries can only be added, never changed or removed.
      </p>

      <p
        role="status"
        className={`mb-6 flex items-center gap-2 rounded-lg border p-4 text-sm font-semibold ${chain.ok ? 'border-border bg-field' : 'border-destructive text-destructive'}`}
      >
        {chain.ok ? <ShieldCheck aria-hidden="true" className="size-5 text-[#2f8a3a]" /> : <ShieldAlert aria-hidden="true" className="size-5" />}
        {chain.ok
          ? `Log intact: all ${chain.count} entries match their checksums.`
          : `Log tampered with: entry #${chain.brokenAt} does not match its checksum.`}
      </p>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">Nothing recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-field">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Audit log, newest first</caption>
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">#</th>
                <th scope="col" className="px-4 py-3 font-semibold">When (IST)</th>
                <th scope="col" className="px-4 py-3 font-semibold">Who</th>
                <th scope="col" className="px-4 py-3 font-semibold">What</th>
                <th scope="col" className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.seq} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{e.seq}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">{when.format(e.at)}</td>
                  <td className="px-4 py-3">{e.actorEmail}</td>
                  <td className={`px-4 py-3 font-semibold ${e.action === 'book_deleted' || e.action === 'login_failed' ? 'text-destructive' : ''}`}>
                    {labels[e.action] ?? e.action}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[e.targetLabel, e.ip && `IP ${e.ip}`].filter(Boolean).join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Audit log pages" className="mt-6 flex items-center gap-3">
          {page > 1 && <Link href={`/admin/audit?page=${page - 1}`} className={buttonVariants({ variant: 'quiet', size: 'sm' })}>Newer</Link>}
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          {page < pages && <Link href={`/admin/audit?page=${page + 1}`} className={buttonVariants({ variant: 'quiet', size: 'sm' })}>Older</Link>}
        </nav>
      )}
    </>
  )
}
