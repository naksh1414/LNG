import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { SubjectMark } from '@/components/subject-mark'
import { cn } from '@/lib/utils'

const audiences = [
  {
    title: 'Families',
    copy: 'Books to read aloud and return to, matched to your child’s age.',
    href: '/catalog',
    subject: 'Nature',
    tone: 'bg-[#fbe3ee] hover:bg-[#f8d3e4]',
    mark: 'text-[#d61f8a]',
  },
  {
    title: 'Teachers',
    copy: 'Titles that follow the areas of a Montessori classroom, ready for circle time and independent reading.',
    href: '/catalog',
    subject: 'Language',
    tone: 'bg-[#e1eafa] hover:bg-[#d3e0f6]',
    mark: 'text-band',
  },
  {
    title: 'Schools',
    copy: 'Order sets for the whole class or the school library, straight from the publisher.',
    href: '/#schools',
    subject: 'Science',
    tone: 'bg-[#fff1bf] hover:bg-[#ffe99a]',
    mark: 'text-foreground',
  },
]

export function AudienceSection() {
  return (
    <section aria-labelledby="audience-heading" className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <Reveal>
        <h2 id="audience-heading" className="max-w-[18ch] text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
          Books for every kind of reader
        </h2>
        <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">
          Whether you read at the kitchen table or teach a room of twenty, start with the shelf that fits.
        </p>
      </Reveal>
      <ul className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
        {audiences.map((a) => (
          <li key={a.title}>
            <Link
              href={a.href}
              className={cn(
                'group flex h-full min-h-72 flex-col rounded-3xl p-7 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
                a.tone,
              )}
            >
              <SubjectMark subject={a.subject} className={cn('size-14', a.mark)} />
              <span className="mt-auto flex items-center justify-between gap-4 pt-10 text-2xl font-bold tracking-[-0.02em]">
                {a.title}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none"
                />
              </span>
              <span className="mt-3 block max-w-[34ch] text-foreground/80">{a.copy}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
