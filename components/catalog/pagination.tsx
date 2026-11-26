import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { pageList } from '@/lib/books/catalog-query'
import { cn } from '@/lib/utils'

const cell =
  'inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

// Plain links, so every page can be opened, shared and indexed. hrefFor builds each page's address.
export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (page: number) => string }) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} scroll={false} rel="prev" className={cn(cell, 'border-input bg-field hover:border-foreground')}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(cell, 'border-transparent text-muted-foreground/50')}>
          <ChevronLeft className="size-4" />
          Previous
        </span>
      )}
      <ol className="flex flex-wrap items-center gap-2">
        {pageList(page, totalPages).map((n, i) =>
          n === 'gap' ? (
            <li key={`gap${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={hrefFor(n)}
                scroll={false}
                aria-label={`Page ${n}`}
                aria-current={n === page ? 'page' : undefined}
                className={cn(cell, n === page ? 'border-foreground bg-foreground text-background' : 'border-input bg-field hover:border-foreground')}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ol>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} scroll={false} rel="next" className={cn(cell, 'border-input bg-field hover:border-foreground')}>
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(cell, 'border-transparent text-muted-foreground/50')}>
          Next
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
