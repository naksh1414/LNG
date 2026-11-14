import { EnquiryForm } from '@/components/enquiry-form'
import { Reveal } from '@/components/reveal'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'

export function EnquirySection() {
  const wa = normalizeNumber(site.whatsappNumber)
  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <Reveal>
          <h2 id="contact-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
            Ask us about a book
          </h2>
          <p className="mt-5 max-w-[38ch] text-lg text-muted-foreground">
            Questions about a title, an order for your class or a book for a child you know. Send a note and we will
            reply.
          </p>
          {wa && (
            <p className="mt-8 text-lg">
              Prefer to chat?{' '}
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Message us on WhatsApp
              </a>
            </p>
          )}
        </Reveal>
        <Reveal delay={0.08}>
          <div className="border-t-2 border-foreground pt-8">
            <EnquiryForm />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
