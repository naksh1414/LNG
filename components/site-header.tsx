'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { site } from '@/lib/site'
import { Wordmark } from './wordmark'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const path = usePathname() ?? ''
  // Hash links (For schools) are sections of home, so they never mark a page as current.
  const current = (href: string) => !href.includes('#') && (path === href || (href === '/catalog' && (path.startsWith('/catalog/') || path.startsWith('/books/'))))
  return (
    <>
      <ScrollProgress className="h-1 from-[#eb2891] via-[#fdcc2d] to-[#2d5ba6]" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Wordmark />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-foreground md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav
            id="main-nav"
            aria-label="Main navigation"
            className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col border-b border-border bg-background px-5 py-2 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-9 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={current(item.href) ? 'page' : undefined}
                className="group relative py-3 text-base font-medium whitespace-nowrap text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent max-md:border-b max-md:border-border max-md:last:border-0 md:py-6 md:text-sm"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100 motion-reduce:transition-none max-md:hidden"
                />
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}
