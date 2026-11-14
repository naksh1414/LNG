import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SubjectsRow({ subjects }: { subjects: string[] }) {
  if (subjects.length === 0) return null
  return (
    <section aria-labelledby="subjects-heading" className="bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <h2 id="subjects-heading" className="text-3xl font-bold md:text-4xl">
            Find a book by subject
          </h2>
          <p className="mt-4 max-w-[30ch] text-background/70">
            Each subject follows an area of the Montessori classroom.
          </p>
        </div>
        <ul className="border-t border-background/20">
          {subjects.map((s) => (
            <li key={s} className="border-b border-background/20">
              <Link
                href={`/catalog?subject=${encodeURIComponent(s)}`}
                className="group flex items-center justify-between gap-6 py-6 text-2xl font-bold tracking-[-0.02em] text-background/85 transition-colors hover:text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background md:py-7 md:text-4xl"
              >
                {s}
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
