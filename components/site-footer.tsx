import Link from 'next/link'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'
import { Wordmark } from './wordmark'

export function SiteFooter() {
  const wa = normalizeNumber(site.whatsappNumber)
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <Wordmark />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              {item.label}
            </Link>
          ))}
          {wa && (
            <a href={`https://wa.me/${wa}`} className="text-muted-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              WhatsApp
            </a>
          )}
        </nav>
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {site.name}</p>
      </div>
    </footer>
  )
}
