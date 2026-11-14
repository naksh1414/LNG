import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'
import { CoverFan } from './cover-fan'

export function Hero({ books }: { books: Book[] }) {
  return (
    <section className="mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-14 px-5 pt-16 pb-24 md:pt-24 lg:pb-36 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
      <div>
        <h1 className="text-[1.95rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[3.75rem]">
          Montessori books for homes and classrooms.
        </h1>
        <p data-testid="hero-subtext" className="mt-7 max-w-[38ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
          Books that follow how children really learn, written for reading at home and teaching in the classroom.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/catalog" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
            Browse books
          </Link>
          <Link href="/#schools" className={cn(buttonVariants({ variant: 'quiet' }), 'h-12 px-7 text-base')}>
            For schools
          </Link>
        </div>
      </div>
      {books.length > 0 && <CoverFan books={books} />}
    </section>
  )
}
