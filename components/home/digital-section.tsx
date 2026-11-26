import { ArrowUpRight, MonitorPlay, Smartphone, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { econtentUrl, site } from '@/lib/site'
import { cn } from '@/lib/utils'

// SAMPLE TEXT: short placeholder descriptions. Replace with the real features of the e-content and the app.
const cards: { title: string; copy: string; icon: LucideIcon; tone: string; href: string; cta: string }[] = [
  {
    title: 'Digital learning',
    copy: 'E-content that goes with the books, ready to use in the classroom.',
    icon: MonitorPlay,
    tone: 'bg-[#e1eafa] hover:bg-[#d3e0f6]',
    href: econtentUrl,
    cta: 'Open e-content',
  },
  {
    title: 'The Learn N Grow app',
    copy: 'Books and lessons on your phone, for practice at home.',
    icon: Smartphone,
    tone: 'bg-[#fff1bf] hover:bg-[#ffe99a]',
    href: site.app.url,
    cta: 'Get the app',
  },
]

const card =
  'group flex h-full items-center gap-4 rounded-2xl p-4 pr-5 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:p-5'

export function DigitalSection() {
  return (
    <section aria-labelledby="digital-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-8 md:py-12">
      <Reveal>
        <h2 id="digital-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
          Learning beyond the page
        </h2>
        <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">E-content for the classroom and an app for practice at home.</p>
      </Reveal>
      <ul className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
        {cards.map((c, i) => {
          const body = (
            <>
              <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/70 md:size-14">
                <c.icon className="size-6 md:size-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold tracking-[-0.01em]">{c.title}</span>
                <span className="mt-0.5 block text-sm text-foreground/75">{c.copy}</span>
              </span>
              {c.href && (
                <span className="flex shrink-0 items-center gap-1 text-sm font-semibold max-sm:sr-only">
                  {c.cta}
                  <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                </span>
              )}
            </>
          )
          return (
            <li key={c.title}>
              <Reveal delay={i * 0.08} className="h-full">
                {c.href ? (
                  <Link href={c.href} target="_blank" rel="noopener noreferrer" aria-label={`${c.title}: ${c.cta}`} className={cn(card, c.tone)}>
                    {body}
                  </Link>
                ) : (
                  <div className={cn(card, c.tone.replace(/ hover:\S+/, ''))}>{body}</div>
                )}
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
