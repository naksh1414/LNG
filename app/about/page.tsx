import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'About us',
  description:
    'Meet Learn and Grow, an independent publisher of Montessori-inspired books for curious children, families and educators.',
}

const principles = [
  {
    title: 'Follow the question',
    copy: 'A child’s curiosity is a wonderful place to begin. Our books invite exploration instead of rushing to the answer.',
  },
  {
    title: 'Respect their pace',
    copy: 'Every child meets the world in their own way. We make thoughtful books that leave room for different paths and discoveries.',
  },
  {
    title: 'Make learning tangible',
    copy: 'Clear language, considered details and hands-on ideas help children connect what they read with the world around them.',
  },
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-20 md:pt-32 md:pb-28">
          <h1 className="max-w-[13ch] text-[2.6rem] leading-[1] font-extrabold tracking-[-0.045em] text-balance sm:text-7xl lg:text-[6.5rem]">
            Books for the way children wonder.
          </h1>
          <p className="mt-10 max-w-[44ch] text-xl leading-relaxed text-muted-foreground md:mt-14 md:ml-[33%] md:text-2xl">
            Learn and Grow is an independent publishing house creating Montessori-inspired books for curious children
            and the grown-ups learning alongside them.
          </p>
        </section>

        <section id="approach" aria-labelledby="approach-heading" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
            <Reveal>
              <h2
                id="approach-heading"
                className="max-w-[18ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-5xl"
              >
                Children are not empty vessels. They arrive full of questions.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid max-w-[52ch] gap-6 text-lg leading-relaxed text-muted-foreground lg:pt-2">
                <p>
                  We believe a good book can open a door, then give a child the time and space to walk through it.
                  That belief shapes what we publish: inviting stories, useful ideas and beautiful details made to be
                  returned to.
                </p>
                <p>
                  Guided by Montessori principles, our work begins with respect for children as capable, active
                  learners. We create books for home, classroom and everywhere a new question takes root.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="principles-heading" className="bg-tint">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <Reveal>
              <h2 id="principles-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
                Small things, thoughtfully made.
              </h2>
            </Reveal>
            <ul className="mt-12 border-b-2 border-foreground md:mt-16">
              {principles.map((p) => (
                <li
                  key={p.title}
                  className="grid gap-3 border-t-2 border-foreground py-8 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:gap-10 md:py-10 lg:gap-20"
                >
                  <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-3xl">{p.title}</h3>
                  <p className="max-w-[46ch] text-lg leading-relaxed text-muted-foreground">{p.copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="begin-heading" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <Reveal>
            <h2 id="begin-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
              Find a book to begin with.
            </h2>
            <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
              Whether you’re choosing a first title or building a classroom shelf, we’d love to help you find the
              right place to start.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/catalog" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
                Explore the books
              </Link>
              <Link href="/contact" className={cn(buttonVariants({ variant: 'quiet' }), 'h-12 px-7 text-base')}>
                Get in touch
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
