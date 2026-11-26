import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { NepSection } from '@/components/nep-section'
import { Reveal } from '@/components/reveal'
import { SubjectMark } from '@/components/subject-mark'
import { buttonVariants } from '@/components/ui/button'
import { normalizeNumber } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const qualities = [
  {
    title: 'Follow the question',
    copy: 'A child’s curiosity is the place to begin. Our books invite exploration instead of rushing to the answer.',
    subject: 'Science',
    tile: 'bg-[#fff1bf] text-foreground',
  },
  {
    title: 'Respect their pace',
    copy: 'Every child meets the world in their own way, so our books leave room for different paths.',
    subject: 'Practical Life',
    tile: 'bg-[#e1eafa] text-band',
  },
  {
    title: 'Make learning tangible',
    copy: 'Clear language, considered details and hands-on ideas connect what children read with the world around them.',
    subject: 'Nature',
    tile: 'bg-[#fbe3ee] text-[#d61f8a]',
  },
]

export function CatalogExtras() {
  const wa = normalizeNumber(site.whatsappNumber)
  return (
    <>
      <section aria-labelledby="qualities-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-12 md:py-16">
        <Reveal>
          <h2 id="qualities-heading" className="max-w-[20ch] text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
            What goes into every book
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {qualities.map((q, i) => (
            <li key={q.title}>
              <Reveal delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-border bg-field p-7">
                  <span aria-hidden="true" className={cn('flex size-14 items-center justify-center rounded-2xl', q.tile)}>
                    <SubjectMark subject={q.subject} className="size-8" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold tracking-[-0.01em]">{q.title}</h3>
                  <p className="mt-2 text-muted-foreground">{q.copy}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <NepSection />

      <section aria-labelledby="class-order-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pb-12 md:pb-16">
        <Reveal>
          <div className="flex flex-col gap-8 rounded-[2rem] bg-tint p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 id="class-order-heading" className="max-w-[18ch] text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
                Ordering for a classroom or library?
              </h2>
              <p className="mt-4 max-w-[44ch] text-lg text-foreground/75">
                Order any title in sets, so every child can read along.
              </p>
            </div>
            <Link href="/#schools" className={cn(buttonVariants(), 'h-12 shrink-0 self-start px-7 text-base md:self-auto')}>
              See classroom orders
            </Link>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="help-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pb-16 md:pb-24">
        <Reveal>
          <div className="flex flex-col gap-8 rounded-[2rem] border border-border bg-field p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 id="help-heading" className="max-w-[20ch] text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
                Can’t find the right book?
              </h2>
              <p className="mt-4 max-w-[44ch] text-lg text-muted-foreground">
                Tell us the age and what the child enjoys, and we will suggest titles that fit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
                Write to us
              </Link>
              {wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'quiet' }), 'h-12 px-7 text-base')}
                >
                  <MessageCircle aria-hidden="true" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
