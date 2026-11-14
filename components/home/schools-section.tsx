import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { buttonVariants } from '@/components/ui/button'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const points = [
  {
    title: 'Copies for the whole class',
    copy: 'Order a title in the quantity your group needs, so every child can read along.',
  },
  {
    title: 'Titles matched to your room',
    copy: 'Tell us the ages and the areas you teach, and we suggest books that fit.',
  },
  {
    title: 'Straight from the publisher',
    copy: 'You speak to the people who make the books, from the first question to delivery.',
  },
]

const contactHref = site.nav.find((n) => n.label === 'Contact')!.href

export function SchoolsSection() {
  return (
    <section id="schools" aria-labelledby="schools-heading" className="scroll-mt-20 bg-tint">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="schools-heading" className="max-w-[16ch] text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
                Books for every child in the class
              </h2>
              <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">
                Schools and teachers can order our books in sets for classrooms and libraries.
              </p>
            </div>
            <Link href={contactHref} className={cn(buttonVariants(), 'h-12 self-start px-7 text-base md:self-auto')}>
              Ask about classroom orders
            </Link>
          </div>
        </Reveal>
        <ul className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
          {points.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.08}>
                <div className="border-t-2 border-foreground pt-6">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <p className="mt-3 max-w-[34ch] text-muted-foreground">{p.copy}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
