import Link from 'next/link'

export function Wordmark() {
  return (
    <Link href="/" aria-label="Learn and Grow home" className="inline-flex items-center gap-3 font-bold tracking-wide text-foreground">
      <span aria-hidden="true" className="flex size-8 items-center justify-center bg-accent text-sm text-accent-foreground">LG</span>
      <span className="whitespace-nowrap text-sm">LEARN AND GROW</span>
    </Link>
  )
}
