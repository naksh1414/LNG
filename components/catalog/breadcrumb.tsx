import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; href?: string }

// The last crumb is the current page and has no link.
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-muted-foreground">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden="true" className="size-3.5" />}
            {c.href ? (
              <Link href={c.href} className="underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
