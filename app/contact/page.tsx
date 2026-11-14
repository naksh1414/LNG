import { EnquiryForm } from '@/components/enquiry-form'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'

export const metadata = {
  title: 'Contact',
  description: 'Ask Learn and Grow about a book, a classroom order or a title for a child you know.',
}

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
  const wa = normalizeNumber(site.whatsappNumber)
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-14 px-5 pt-20 pb-24 md:pt-28 md:pb-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div>
          <h1 className="text-[2.6rem] leading-[1] font-extrabold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
            Write to us
          </h1>
          <p className="mt-7 max-w-[38ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
            Questions about a title, an order for your class or a book for a child you know. Send a note and we will
            reply.
          </p>
          {(email || wa) && (
            <dl className="mt-12 border-t border-border text-lg">
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
        </div>
        <div className="lg:border-t-2 lg:border-foreground lg:pt-8">
          <EnquiryForm />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
