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
    <section aria-labelledby="press-heading" className="mx-auto max-w-6xl px-5 pt-24 pb-20 md:pt-36 md:pb-28">
      <Reveal>
        <h2
          id="press-heading"
          className="max-w-[17ch] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-6xl lg:text-[5.25rem]"
        >
          Children are not empty vessels. They arrive full of questions.
        </h2>
      </Reveal>
      <div className="mt-12 max-w-[60ch] md:mt-16 md:ml-[33%]">
        <Reveal>
          <p className="text-xl leading-relaxed md:text-2xl">
            Learn and Grow is an independent press making Montessori books for curious children and the grown-ups
            learning alongside them.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            We believe a good book can open a door, then give a child the time to walk through it. Guided by
            Montessori principles, we treat children as capable, active learners, and make books to return to at home
            and in the classroom.
          </p>
        </Reveal>
        <ul className="mt-12 grid gap-6 border-t border-border pt-10">
          {principles.map((p) => (
            <li key={p.title} className="text-lg leading-relaxed text-muted-foreground">
              <strong className="font-bold text-foreground">{p.title}</strong> {p.copy}
            </li>
          ))}
        </ul>
        <Link
          href="/about"
          className="mt-10 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent"
        >
          More about the press
        </Link>
      </div>
    </section>
  )
}
