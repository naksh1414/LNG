'use client'

import { ChartNoAxesColumn, Inbox, KeyRound, Library, LogOut, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  { href: '/admin/series', label: 'Series', icon: Library },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/metrics', label: 'Metrics', icon: ChartNoAxesColumn },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
  { href: '/admin/password', label: 'Change password', icon: KeyRound },
]

// Book pages belong to a series, so they keep "Series" highlighted.
const isCurrent = (path: string, href: string) =>
  path === href || path.startsWith(`${href}/`) || (href === '/admin/series' && path.startsWith('/admin/books/'))

export function AdminNav({ unread = 0 }: { unread?: number }) {
  const path = usePathname() ?? ''
  return (
    <nav aria-label="Admin" className="flex flex-1 items-center gap-2 overflow-x-auto md:flex-col md:items-stretch md:gap-0 md:overflow-visible">
      <ul className="flex gap-1 md:grid">
        {items.map(({ href, label, icon: Icon }) => {
          const current = isCurrent(path, href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  current ? 'bg-foreground text-background' : 'text-foreground hover:bg-border/50',
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
                {href === '/admin/enquiries' && unread > 0 && (
                  <span className={cn('ml-auto rounded-full px-2 text-xs font-semibold', current ? 'bg-background text-foreground' : 'bg-accent text-accent-foreground')}>
                    {unread}
                    <span className="sr-only"> new</span>
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
      <form method="post" action="/api/admin/logout" className="shrink-0 md:mt-auto md:pt-6">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:bg-border/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          Log out
        </button>
      </form>
    </nav>
  )
}
