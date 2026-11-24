import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Wordmark } from '@/components/wordmark'
import { AdminNav } from '@/components/admin/admin-nav'
import { countUnread } from '@/lib/enquiries/repo'
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Signed out means the login page (proxy.ts redirects every other admin page): no chrome.
  const session = await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value)
  if (!session) return <main className="min-h-[100dvh] bg-background">{children}</main>

  // A failed count must not take the admin panel down.
  const unread = await countUnread().catch(() => 0)

  return (
    <div className="min-h-[100dvh] bg-background md:grid md:grid-cols-[16rem_1fr]">
      <aside className="flex flex-col border-b border-border bg-field p-4 md:sticky md:top-0 md:h-[100dvh] md:border-r md:border-b-0 md:p-5">
        <div className="mb-3 md:mb-6">
          <Wordmark />
          <p className="mt-3 hidden text-sm font-medium text-muted-foreground md:block">Admin</p>
        </div>
        <AdminNav unread={unread} />
      </aside>
      <main className="min-w-0 p-6 md:p-10">{children}</main>
    </div>
  )
}
