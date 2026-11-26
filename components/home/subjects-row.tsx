import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SubjectMark } from '@/components/subject-mark'

export function SubjectsRow({ subjects }: { subjects: string[] }) {
  if (subjects.length === 0) return null
  return (
    <section aria-labelledby="subjects-heading" className="bg-background">
      <div className="mx-auto grid max-w-6xl 2xl:max-w-[100rem] gap-10 px-5 py-8 md:py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <h2 id="subjects-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
            Find a book by subject
          </h2>
          <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">
            Each subject follows an area of the Montessori classroom.
          </p>
        </div>
        <ul className="border-t border-border">
          {subjects.map((s) => (
            <li key={s} className="border-b border-border">
              <Link
                href={`/catalog?subject=${encodeURIComponent(s)}`}
                className="group flex items-center justify-between gap-6 py-6 text-2xl font-bold tracking-[-0.02em] text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:py-7 md:text-4xl"
              >
                <span className="flex items-center gap-5 md:gap-7">
                  <SubjectMark
                    subject={s}
                    className="size-7 shrink-0 text-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[-8deg] motion-reduce:transition-none md:size-9"
                  />
                  {s}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-6 shrink-0 transition-transform duration-300 text-accent group-hover:translate-x-1.5 motion-reduce:transition-none md:size-8"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
