import { MapPin } from 'lucide-react'
import { EnquiryForm } from '@/components/enquiry-form'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { buttonVariants } from '@/components/ui/button'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Contact',
  description: 'Ask Learn N Grow about a book, a classroom order or a title for a child you know.',
}

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
  const wa = normalizeNumber(site.whatsappNumber)
  const { phone, address, directionsUrl } = site.contact
  const row = 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-5'
  const anchor = 'font-semibold underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl 2xl:max-w-[100rem] gap-14 px-5 pt-20 pb-24 md:pt-28 md:pb-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div>
          <h1 className="text-[2.6rem] leading-[1] font-extrabold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
            Write to us
          </h1>
          <p className="mt-7 max-w-[38ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
            Questions about a title, an order for your class or a book for a child you know. Send a note and we will
            reply.
          </p>
          {(email || wa || phone || address) && (
            <dl className="mt-12 border-t border-border text-lg">
              {phone && (
                <div className={row}>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>
                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={anchor}>
                      {phone}
                    </a>
                  </dd>
                </div>
              )}
              {address && (
                <div className={row}>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="max-w-[28ch] text-right font-semibold whitespace-pre-line max-sm:text-left">{address}</dd>
                </div>
              )}
              {email && (
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-5">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>
                    <a href={`mailto:${email}`} className="font-semibold break-all underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      {email}
                    </a>
                  </dd>
                </div>
              )}
              {wa && (
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-5">
                  <dt className="text-muted-foreground">WhatsApp</dt>
                  <dd>
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      +{wa}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants(), 'mt-8 h-12 px-7 text-base')}
            >
              <MapPin aria-hidden="true" />
              Get directions
            </a>
          )}
        </div>
        <div className="rounded-lg border border-border bg-field p-6 sm:p-8">
          <EnquiryForm />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
