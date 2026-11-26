import { BookOpenCheck, Puzzle, Sprout, Target } from 'lucide-react'
import { Reveal } from '@/components/reveal'

// Compliance claims: edit this list to match what the books really cover.
const nep = [
  { icon: Sprout, title: 'Foundational stage focus', copy: 'Titles for ages 3 to 8, the foundational stage in NEP 2020.' },
  { icon: Puzzle, title: 'Play and activity based', copy: 'Hands-on ideas that turn reading into doing, as NEP 2020 recommends.' },
  { icon: Target, title: 'Competency based', copy: 'Each book builds a clear skill: reading, number sense, observation or care for the environment.' },
  { icon: BookOpenCheck, title: 'Age-graded titles', copy: 'Every book shows the ages it suits, so you can pick with confidence.' },
]

export function NepSection() {
  return (
    <section aria-labelledby="nep-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-8 md:py-12">
      <Reveal>
        <div className="rounded-[2rem] bg-[#f3eefb] p-8 md:p-12">
          <h2 id="nep-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
            Aligned with NEP 2020
          </h2>
          <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">
            Our books follow the priorities of India’s National Education Policy for the early years.
          </p>
          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nep.map((n) => (
              <li key={n.title} className="rounded-2xl bg-field p-5">
                <n.icon aria-hidden="true" className="size-7 text-accent" />
                <h3 className="mt-4 text-lg font-bold tracking-[-0.01em]">{n.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  )
}
