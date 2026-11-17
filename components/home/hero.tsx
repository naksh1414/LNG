import Link from 'next/link'
import { SubjectMark } from '@/components/subject-mark'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Bento of subject tiles; swap a tile's content for a photo when real ones exist.
const tiles = [
  { subject: 'Nature', label: 'Nature', tone: 'bg-[#d61f8a] text-white', mark: 'text-white/90', area: 'col-start-1 row-start-1' },
  { subject: 'Language', label: 'Language', tone: 'bg-band text-white', mark: 'text-white/90', area: 'col-start-1 row-start-2' },
  { subject: 'Science', label: 'Science and culture', tone: 'bg-[#fdcc2d] text-foreground', mark: 'text-foreground', area: 'col-start-2 row-span-2 row-start-1' },
]

export function Hero() {
  return (
    <section className="relative bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
      <div className="mx-auto grid min-h-[calc(100dvh-6.5rem)] max-w-6xl items-center gap-12 px-5 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-field px-4 py-1.5 text-sm font-semibold">
            <span aria-hidden="true" className="size-2 rounded-full bg-[#6cc24a]" />
            Aligned with NEP 2020
          </p>
          <h1 className="text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
            Montessori books for homes and classrooms.
          </h1>
          <p data-testid="hero-subtext" className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
            Books that follow how children really learn, written for reading at home and teaching in the classroom.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/catalog" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
              Browse books
            </Link>
            <Link href="/#schools" className={cn(buttonVariants({ variant: 'quiet' }), 'h-12 border-accent px-7 text-base text-accent hover:bg-accent/5')}>
              For schools
            </Link>
          </div>
        </div>
        <ul aria-hidden="true" className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 lg:ml-auto lg:w-full lg:max-w-[28rem]">
          {tiles.map((t) => (
            <li key={t.subject} className={cn('flex flex-col justify-between rounded-3xl p-5 sm:p-6', t.tone, t.area, t.area.includes('row-span-2') ? 'min-h-72' : 'min-h-36 sm:min-h-44')}>
              <SubjectMark subject={t.subject} className={cn('size-14 sm:size-20', t.mark)} />
              <span className="text-base font-bold tracking-[-0.01em] sm:text-lg">{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Fades the gradient into the page colour so the next section starts smoothly. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  )
}
