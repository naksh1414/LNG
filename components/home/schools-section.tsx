import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { SubjectMark } from '@/components/subject-mark'
import { buttonVariants } from '@/components/ui/button'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const points = [
  {
    title: 'Copies for the whole class',
    copy: 'Order a title in the quantity your group needs, so every child can read along.',
    subject: 'Language',
    tile: 'bg-[#fff1bf] text-foreground',
  },
  {
    title: 'Titles matched to your room',
    copy: 'Tell us the ages and the areas you teach, and we suggest books that fit.',
    subject: 'Practical Life',
    tile: 'bg-[#e1eafa] text-band',
  },
  {
    title: 'Straight from the publisher',
    copy: 'You speak to the people who make the books, from the first question to delivery.',
    subject: 'Nature',
    tile: 'bg-[#fbe3ee] text-[#d61f8a]',
  },
]

const contactHref = site.nav.find((n) => n.label === 'Contact')!.href

export function SchoolsSection() {
  return (
    <section id="schools" aria-labelledby="schools-heading" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 md:py-16">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-5">
        <Reveal>
          <div className="flex h-full flex-col rounded-3xl bg-tint p-8 md:p-10">
            <h2 id="schools-heading" className="max-w-[14ch] text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
              Books for every child in the class
            </h2>
            <p className="mt-5 max-w-[36ch] text-lg text-foreground/75">
              Schools and teachers can order our books in sets for classrooms and libraries.
            </p>
            <Link href={contactHref} className={cn(buttonVariants(), 'mt-10 h-auto min-h-12 self-start px-7 py-3 text-base whitespace-normal lg:mt-auto')}>
              Ask about classroom orders
            </Link>
          </div>
        </Reveal>
        <ul className="grid gap-4 lg:gap-5">
          {points.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.08}>
                <div className="flex items-center gap-5 rounded-3xl border border-border bg-field p-6 md:p-7">
                  <span aria-hidden="true" className={cn('flex size-16 shrink-0 items-center justify-center rounded-2xl', p.tile)}>
                    <SubjectMark subject={p.subject} className="size-9" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold tracking-[-0.01em]">{p.title}</h3>
                    <p className="mt-1.5 max-w-[42ch] text-muted-foreground">{p.copy}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
