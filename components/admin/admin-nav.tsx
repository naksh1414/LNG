'use client'

import { ChartNoAxesColumn, Inbox, KeyRound, LayoutDashboard, Library, LogOut, MessageSquareQuote, ScrollText, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { can, type Area, type Permissions } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'

// area: what the user needs to see the item (users: write is the owner only). No area: every admin.
const items: { href: string; label: string; icon: typeof Library; area?: Area; level?: 'read' | 'write' }[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/series', label: 'Series', icon: Library, area: 'catalog' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote, area: 'testimonials' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox, area: 'enquiries' },
  { href: '/admin/metrics', label: 'Metrics', icon: ChartNoAxesColumn, area: 'metrics' },
  { href: '/admin/users', label: 'Users', icon: Users, area: 'users', level: 'write' },
  { href: '/admin/roles', label: 'Roles', icon: ShieldCheck, area: 'users', level: 'write' },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText, area: 'audit' },
  { href: '/admin/password', label: 'Change password', icon: KeyRound },
]

// Book pages belong to a series, so they keep "Series" highlighted. The dashboard is exact: every admin path starts with /admin.
const isCurrent = (path: string, href: string) =>
  path === href ||
  (href !== '/admin' && path.startsWith(`${href}/`)) ||
  (href === '/admin/series' && path.startsWith('/admin/books/'))

export function AdminNav({ unread = 0, permissions, roleName, email }: { unread?: number; permissions: Permissions; roleName: string; email: string }) {
  const path = usePathname() ?? ''
  return (
    <nav aria-label="Admin" className="flex flex-1 items-center gap-2 overflow-x-auto md:flex-col md:items-stretch md:gap-0 md:overflow-visible">
      <ul className="flex gap-1 md:grid">
        {items.filter((i) => !i.area || can(permissions, i.area, i.level)).map(({ href, label, icon: Icon }) => {
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
        <p className="mb-2 hidden px-3 text-xs text-muted-foreground md:block">
          <span className="block truncate font-medium text-foreground">{email}</span>
          {roleName}
        </p>
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
