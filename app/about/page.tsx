import Image from 'next/image'
import Link from 'next/link'
import { BookCover } from '@/components/book-cover'
import { Reveal } from '@/components/reveal'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SubjectMark } from '@/components/subject-mark'
import { buttonVariants } from '@/components/ui/button'
import { ageLabel } from '@/lib/books/format'
import { groupBySeries, spreadAcrossSeries } from '@/lib/books/hierarchy'
import { listPublishedBooks } from '@/lib/books/repo'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'About us',
  description:
    'Meet Learn N Grow, an independent press of Montessori-inspired books for curious children, families and educators.',
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

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  // A failed read hides the series list instead of taking the page down.
  const books = await listPublishedBooks().catch(() => [])
  const series = groupBySeries(books)
  // One cover per series first, so the picture is not all one series.
  const covers = spreadAcrossSeries(books.filter((b) => b.coverUrl)).slice(0, 4)
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
          <div className="mx-auto grid max-w-6xl 2xl:max-w-[100rem] items-center gap-12 px-5 py-14 md:py-24 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <h1 className="text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
                Books for the way children wonder.
              </h1>
              <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">
                Learn N Grow is an independent publishing house creating Montessori-inspired books for curious
                children and the grown-ups learning alongside them.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/catalog" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
                  Explore the books
                </Link>
              </div>
            </div>
            {covers.length > 0 && (
              <ul aria-hidden="true" className="mx-auto grid w-full max-w-md grid-cols-2 gap-4">
                {covers.map((b, i) => (
                  <li key={b.id} className={i % 2 ? 'translate-y-6' : undefined}>
                    <BookCover book={b} index={i} decorative className="rounded-2xl" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section id="approach" aria-labelledby="approach-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] scroll-mt-20 px-5 py-12 md:py-20">
          <div className="grid gap-10 rounded-[2rem] border border-border bg-field p-8 md:p-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <Reveal>
              <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-[#fff1bf] text-foreground">
                <SubjectMark subject="Science" className="size-8" />
              </span>
              <h2
                id="approach-heading"
                className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl"
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

        <section aria-labelledby="principles-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pb-12 md:pb-20">
          <Reveal>
            <h2 id="principles-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
              Small things, thoughtfully made.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
            {principles.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.08} className="h-full">
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

        <section aria-labelledby="founder-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pb-12 md:pb-20">
          <Reveal>
            <div className="grid gap-8 rounded-[2rem] border border-border bg-field p-8 md:p-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
              <div>
                {site.founder.image ? (
                  <Image
                    src={site.founder.image}
                    alt={`${site.founder.name}, ${site.founder.role}`}
                    width={480}
                    height={480}
                    className="aspect-square w-48 rounded-3xl object-cover shadow-[0_24px_40px_-24px_rgba(27,34,54,0.6)] lg:w-full lg:max-w-xs"
                  />
                ) : (
                  <span aria-hidden="true" className="flex size-24 items-center justify-center rounded-full bg-tint text-4xl font-bold">
                    {site.founder.name[0]}
                  </span>
                )}
                <p className="mt-5 text-xl font-bold tracking-[-0.01em]">{site.founder.name}</p>
                <p className="text-muted-foreground">{site.founder.role}</p>
              </div>
              <div>
                <h2 id="founder-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
                  A message from our founder
                </h2>
                <div className="mt-6 grid max-w-[60ch] gap-4 text-lg leading-relaxed text-muted-foreground">
                  {site.founder.message.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {series.length > 0 && (
          <section aria-labelledby="publish-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pb-12 md:pb-20">
            <div className="grid gap-10 rounded-[2rem] bg-[#f3eefb] p-8 md:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              <Reveal>
                <h2 id="publish-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
                  What we publish
                </h2>
                <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">
                  Every series from the press, with books for each class from the early years up.
                </p>
              </Reveal>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {series.map((s, i) => (
                  <li key={s.slug}>
                    <Reveal delay={i * 0.08} className="h-full">
                      <Link
                        href={`/catalog/${s.slug}`}
                        className="block h-full rounded-3xl bg-field p-6 transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:p-7"
                      >
                        <p className="text-sm font-semibold text-accent">{ageLabel(s.ageMin, s.ageMax)}</p>
                        <h3 className="mt-1 text-xl font-bold tracking-[-0.01em]">{s.name}</h3>
                        <p className="mt-2 text-muted-foreground">
                          {s.books.length} {s.books.length === 1 ? 'book' : 'books'} across {s.subjects.length}{' '}
                          {s.subjects.length === 1 ? 'subject' : 'subjects'}.
                        </p>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="begin-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-12 md:py-20">
          <Reveal>
            <div className="text-center">
            <h2 id="begin-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
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
