import Image from 'next/image'
import Link from 'next/link'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'

const link =
  'w-fit text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function SiteFooter() {
  const wa = normalizeNumber(site.whatsappNumber)
  return (
    <footer className="mt-8 bg-field">
      {/* The logo's four colours as a thin top edge. */}
      <div aria-hidden="true" className="drift h-1 bg-gradient-to-r from-[#eb2891] via-[#fdcc2d] to-[#2d5ba6]" />
      <div className="mx-auto grid max-w-6xl 2xl:max-w-[100rem] gap-10 px-5 pt-14 pb-8 md:grid-cols-[minmax(0,6fr)_minmax(0,3fr)_minmax(0,3fr)] md:pt-16">
        <div>
          {/* Full logo with the company name. 480x127 is about 2x the rendered height, so the file stays small. */}
          <Link href="/" aria-label="Learn N Grow Publications home" className="inline-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <Image src="/logo-publications.png" alt="" width={480} height={127} className="h-12 w-auto md:h-14" />
          </Link>
          <p className="mt-6 max-w-[26ch] text-2xl leading-snug font-bold tracking-[-0.02em] text-balance">
            Montessori books for homes and classrooms.
          </p>
        </div>
        <nav aria-label="Footer" className="grid content-start gap-3">
          <p className="font-semibold">Explore</p>
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className={link} {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}>
              {item.label}
            </Link>
          ))}
          {site.app.url && (
            <a href={site.app.url} target="_blank" rel="noopener noreferrer" className={link}>
              Get the app
            </a>
          )}
        </nav>
        <div className="grid content-start gap-3">
          <p className="font-semibold">Message</p>
          {wa ? (
            <a href={`https://wa.me/${wa}`} className={link}>
              WhatsApp
            </a>
          ) : (
            <Link href="/#contact" className={link}>
              Enquiry form
            </Link>
          )}
        </div>
        <p className="border-t border-border pt-6 text-sm text-muted-foreground md:col-span-3">
          &copy; {new Date().getFullYear()} {site.name}. An independent press.
        </p>
      </div>
    </footer>
  )
}
