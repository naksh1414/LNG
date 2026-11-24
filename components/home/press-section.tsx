import Link from 'next/link'
import { Reveal } from '@/components/reveal'

const principles = [
  {
    title: 'Follow the question.',
    copy: 'A child’s curiosity is the place to begin. Our books invite exploration instead of rushing to the answer.',
  },
  {
    title: 'Respect their pace.',
    copy: 'Every child meets the world in their own way, so our books leave room for different paths.',
  },
  {
    title: 'Make learning tangible.',
    copy: 'Clear language, considered details and hands-on ideas connect what children read with the world around them.',
  },
]

export function PressSection() {
  return (
    <section aria-labelledby="press-heading" className="bg-field">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20">
        <Reveal>
          <h2
            id="press-heading"
            className="max-w-[20ch] text-[2.2rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl"
          >
            Children are not empty vessels. They arrive full of questions.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="max-w-[44ch] text-xl leading-relaxed">
              Learn and Grow is an independent press making Montessori books for curious children and the grown-ups
              learning alongside them.
            </p>
            <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
              We believe a good book can open a door, then give a child the time to walk through it. Guided by
              Montessori principles, we treat children as capable, active learners, and make books to return to at home
              and in the classroom.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              More about the press
            </Link>
          </Reveal>
          <ul className="grid gap-3">
            {principles.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.08}>
                  <div className="rounded-3xl bg-background p-6 text-lg leading-relaxed text-muted-foreground ring-1 ring-border">
                    <strong className="block text-xl font-bold tracking-[-0.01em] text-foreground">{p.title}</strong>
                    <span className="mt-1.5 block">{p.copy}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
