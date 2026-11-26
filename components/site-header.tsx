'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { site } from '@/lib/site'
import { Wordmark } from './wordmark'

type Entry = { label: string; href: string }
type Lists = { series: { name: string; slug: string }[]; subjects: string[] }

const linkCls =
  'group relative py-3 text-base font-medium whitespace-nowrap text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent max-md:border-b max-md:border-border md:py-6 md:text-base'

// Click-to-open list of links; closes on outside click, Escape, or choosing a link.
function Dropdown({ label, items, onPick }: { label: string; items: Entry[]; onPick: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const out = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', out)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', out)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  if (items.length === 0) return null
  return (
    <div ref={ref} className="relative max-md:border-b max-md:border-border">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`${linkCls} flex w-full items-center gap-1 max-md:border-0`}>
        {label}
        <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="pb-2 md:absolute md:top-full md:left-0 md:z-50 md:max-h-[70vh] md:min-w-56 md:overflow-auto md:rounded-xl md:border md:border-border md:bg-background md:p-2 md:shadow-lg">
          {items.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                onClick={() => {
                  setOpen(false)
                  onPick()
                }}
                className="block rounded-lg px-3 py-2 text-base hover:bg-tint hover:text-accent focus-visible:outline-2 focus-visible:outline-accent max-md:pl-5"
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SiteHeader() {
  const [lists, setLists] = useState<Lists>({ series: [], subjects: [] })
  useEffect(() => {
    // Menus stay hidden if this fails; the fixed links always work.
    const controller = new AbortController()
    fetch('/api/nav', { signal: controller.signal })
      .then((r) => r.json() as Promise<Lists>)
      .then(setLists)
      .catch(() => {})
    return () => controller.abort()
  }, [])
  const [open, setOpen] = useState(false)
  const path = usePathname() ?? ''
  // Hash links (For schools) are sections of home, so they never mark a page as current.
  const current = (href: string) => !href.includes('#') && (path === href || (href === '/catalog' && (path.startsWith('/catalog/') || path.startsWith('/books/'))))
  return (
    <>
      <ScrollProgress className="h-1 from-[#eb2891] via-[#fdcc2d] to-[#2d5ba6]" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.4rem] max-w-6xl 2xl:max-w-[100rem] items-center justify-between px-5">
          <Wordmark className="[&_img]:h-[50px]" />
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
            className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col border-b border-border bg-background px-5 py-2 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            {site.nav.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                aria-current={current(item.href) ? 'page' : undefined}
                className="group relative py-3 text-base font-medium whitespace-nowrap text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent max-md:border-b max-md:border-border max-md:last:border-0 md:py-6 md:text-base"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100 motion-reduce:transition-none max-md:hidden"
                />
              </Link>
            ))}
            <Dropdown label="Series" onPick={() => setOpen(false)} items={lists.series.map((x) => ({ label: x.name, href: `/catalog/${x.slug}` }))} />
            <Dropdown label="Subjects" onPick={() => setOpen(false)} items={lists.subjects.map((x) => ({ label: x, href: `/catalog?subject=${encodeURIComponent(x)}` }))} />
            {site.nav.slice(2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                aria-current={current(item.href) ? 'page' : undefined}
                className="group relative py-3 text-base font-medium whitespace-nowrap text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent max-md:border-b max-md:border-border max-md:last:border-0 md:py-6 md:text-base"
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
