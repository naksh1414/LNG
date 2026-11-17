import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Wordmark } from '@/components/wordmark'
import { buttonVariants } from '@/components/ui/button'
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth/session'
import { countUnread } from '@/lib/enquiries/repo'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

const linkClass = 'block rounded-sm px-3 py-2 text-sm font-semibold text-foreground hover:bg-border/40 focus-visible:outline-2 focus-visible:outline-accent'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Signed out means the login page (proxy.ts redirects every other admin page): no chrome.
  const session = await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value)
  if (!session) return <main className="min-h-[100dvh] bg-background">{children}</main>

  // A failed count must not take the admin panel down.
  const unread = await countUnread().catch(() => null)

  return (
    <div className="min-h-[100dvh] bg-background md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-border p-4 md:border-r md:border-b-0">
        <Wordmark />
        <nav aria-label="Admin" className="mt-6">
          <ul className="grid gap-1">
            <li><Link href="/admin/books" className={linkClass}>Books</Link></li>
            <li>
              <Link href="/admin/enquiries" className={`${linkClass} flex items-center justify-between`}>
                Enquiries
                {!!unread && (
                  <span className="rounded-sm bg-accent px-1.5 text-xs text-accent-foreground">
                    {unread}
                    <span className="sr-only"> unread</span>
                  </span>
                )}
              </Link>
            </li>
            <li><Link href="/admin/metrics" className={linkClass}>Metrics</Link></li>
            <li><Link href="/admin/password" className={linkClass}>Change password</Link></li>
          </ul>
        </nav>
        <form method="post" action="/api/admin/logout" className="mt-6">
          <button type="submit" className={buttonVariants({ variant: 'quiet', size: 'sm', className: 'w-full' })}>Log out</button>
        </form>
      </aside>
      <main className="p-6 md:p-10">{children}</main>
    </div>
  )
}
