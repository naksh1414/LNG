import { facts } from '@/components/catalog/catalog-hero'
import type { Book } from '@/lib/books/types'

// Quiet inline row of live numbers from the published books; no tile colours.
export function StatsStrip({ books }: { books: Book[] }) {
  const items = facts(books)
  if (!items.length) return null
  return (
    <section aria-label="The catalogue at a glance" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-8 md:py-12">
      <dl className="grid grid-cols-2 gap-y-5 border-y border-border py-6 sm:grid-cols-4 sm:divide-x sm:divide-border">
        {items.map((t) => (
          <div key={t.label} className="px-4 text-center">
            <dd className="text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">{t.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{t.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
