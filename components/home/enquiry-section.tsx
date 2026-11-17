import { MessageCircle } from 'lucide-react'
import { EnquiryForm } from '@/components/enquiry-form'
import { Reveal } from '@/components/reveal'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'

export function EnquirySection() {
  const wa = normalizeNumber(site.whatsappNumber)
  return (
    <section id="contact" aria-labelledby="contact-heading" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 md:py-16">
      <div className="grid overflow-hidden rounded-[2rem] border border-border bg-field lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal>
          <div className="flex h-full flex-col bg-[#f3eefb] p-8 md:p-12">
            <h2 id="contact-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
              Ask us about a book
            </h2>
            <p className="mt-5 max-w-[38ch] text-lg text-foreground/75">
              Questions about a title, an order for your class or a book for a child you know. Send a note and we will
              reply.
            </p>
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-10 flex items-center gap-4 rounded-2xl bg-field p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:mt-auto"
              >
                <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#fbe3ee] text-[#d61f8a]">
                  <MessageCircle className="size-6" />
                </span>
                <span>
                  <span className="block font-semibold">Message us on WhatsApp</span>
                  <span className="block text-sm text-muted-foreground">Prefer to chat? We reply there too.</span>
                </span>
              </a>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="p-8 md:p-12">
            <EnquiryForm />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
