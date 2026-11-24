import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SubjectMark } from '@/components/subject-mark'
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
    subject: 'Science',
    tile: 'bg-[#fff1bf] text-foreground',
  },
  {
    title: 'Respect their pace',
    copy: 'Every child meets the world in their own way. We make thoughtful books that leave room for different paths and discoveries.',
    subject: 'Practical Life',
    tile: 'bg-[#e1eafa] text-band',
  },
  {
    title: 'Make learning tangible',
    copy: 'Clear language, considered details and hands-on ideas help children connect what they read with the world around them.',
    subject: 'Nature',
    tile: 'bg-[#fbe3ee] text-[#d61f8a]',
  },
]

const series = [
  { label: 'Dreamscape Art and Craft A to C', ages: 'Ages 3 to 5', copy: 'First colouring, drawing and tear and paste activities.' },
  { label: 'Dreamscape Art and Craft 1 to 5', ages: 'Ages 6 to 10', copy: 'Paper models, paper craft, origami and fun facts that grow with the child.' },
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:py-24 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <h1 className="text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
                Books for the way children wonder.
              </h1>
              <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
                Learn and Grow is an independent publishing house creating Montessori-inspired books for curious
                children and the grown-ups learning alongside them.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/catalog" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
                  Explore the books
                </Link>
              </div>
            </div>
            <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-md">
              <Image
                src="/Books/dreamscape-a.jpg"
                alt=""
                width={640}
                height={640}
                className="bob absolute top-0 left-0 w-[62%] -rotate-6 rounded-3xl shadow-[0_30px_50px_-24px_rgba(27,34,54,0.6)]"
              />
              <Image
                src="/Books/dreamscape-1.jpg"
                alt=""
                width={640}
                height={640}
                style={{ animationDelay: '-3s' }}
                className="bob absolute right-0 bottom-0 w-[62%] rotate-6 rounded-3xl shadow-[0_30px_50px_-24px_rgba(27,34,54,0.6)]"
              />
            </div>
          </div>
        </section>

        <section id="approach" aria-labelledby="approach-heading" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 md:py-20">
          <div className="grid gap-10 rounded-[2rem] border border-border bg-field p-8 md:p-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <Reveal>
              <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-[#fff1bf] text-foreground">
                <SubjectMark subject="Science" className="size-8" />
              </span>
              <h2
                id="approach-heading"
                className="mt-8 max-w-[16ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-5xl"
              >
                Children are not empty vessels. They arrive full of questions.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid max-w-[52ch] gap-6 text-lg leading-relaxed text-muted-foreground lg:pt-3">
                <p>
                  We believe a good book can open a door, then give a child the time and space to walk through it.
                  That belief shapes what we publish: inviting stories, useful ideas and beautiful details made to be
                  returned to.
                </p>
                <p className="rounded-2xl border-l-4 border-accent bg-tint/60 p-6 text-foreground">
                  Guided by Montessori principles, our work begins with respect for children as capable, active
                  learners. We create books for home, classroom and everywhere a new question takes root.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="principles-heading" className="mx-auto max-w-6xl px-5 pb-12 md:pb-20">
          <Reveal>
            <h2 id="principles-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
              Small things, thoughtfully made.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
            {principles.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.08}>
                  <div className="h-full rounded-3xl border border-border bg-field p-7">
                    <span aria-hidden="true" className={cn('flex size-14 items-center justify-center rounded-2xl', p.tile)}>
                      <SubjectMark subject={p.subject} className="size-8" />
                    </span>
                    <h3 className="mt-6 text-xl font-bold tracking-[-0.01em]">{p.title}</h3>
                    <p className="mt-2 text-muted-foreground">{p.copy}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="publish-heading" className="mx-2 rounded-[2rem] bg-[#f3eefb] sm:mx-4">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <Reveal>
              <h2 id="publish-heading" className="max-w-[14ch] text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
                What we publish
              </h2>
              <p className="mt-5 max-w-[36ch] text-lg text-foreground/75">
                Art and craft activity books that follow the early years of learning, aligned with NEP 2020.
              </p>
            </Reveal>
            <ul className="grid gap-4">
              {series.map((s, i) => (
                <li key={s.label}>
                  <Reveal delay={i * 0.08}>
                    <div className="rounded-3xl bg-field p-6 md:p-7">
                      <p className="text-sm font-semibold text-accent">{s.ages}</p>
                      <h3 className="mt-1 text-xl font-bold tracking-[-0.01em]">{s.label}</h3>
                      <p className="mt-2 text-muted-foreground">{s.copy}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="begin-heading" className="mx-auto max-w-6xl px-5 py-12 md:py-20">
          <Reveal>
            <div className="text-center">
            <h2 id="begin-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
              Find a book to begin with.
            </h2>
            <p className="mx-auto mt-5 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
              Whether you’re choosing a first title or building a classroom shelf, we’d love to help you find the
              right place to start.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/catalog" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
                Explore the books
              </Link>
              <Link href="/contact" className={cn(buttonVariants({ variant: 'quiet' }), 'h-12 px-7 text-base')}>
                Write to us
              </Link>
            </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
