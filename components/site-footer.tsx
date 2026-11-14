import Link from 'next/link'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'
import { Wordmark } from './wordmark'

const link =
  'text-background/75 transition-colors hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background'

export function SiteFooter() {
  const wa = normalizeNumber(site.whatsappNumber)
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-16 pb-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:pt-20">
        <div>
          <Wordmark className="text-background focus-visible:outline-background" />
          <p className="mt-6 max-w-[30ch] text-2xl leading-snug font-bold tracking-[-0.02em] text-balance md:text-3xl">
            Montessori books for homes and classrooms.
          </p>
        </div>
        <nav aria-label="Footer" className="grid content-start gap-3 text-base md:justify-self-end">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className={link}>
              {item.label}
            </Link>
          ))}
          {wa && (
            <a href={`https://wa.me/${wa}`} className={link}>
              WhatsApp
            </a>
          )}
        </nav>
        <p className="border-t border-background/15 pt-6 text-sm text-background/70 md:col-span-2">
          &copy; {new Date().getFullYear()} {site.name}. An independent press.
        </p>
      </div>
    </footer>
  )
}
