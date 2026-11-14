import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Learn and Grow home" className={cn('group inline-flex items-center gap-3 font-bold tracking-wide text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', className)}>
      <span aria-hidden="true" className="flex size-8 items-center justify-center bg-accent text-sm tracking-normal text-accent-foreground transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none">LG</span>
      <span className="whitespace-nowrap text-sm tracking-[0.08em]">LEARN AND GROW</span>
    </Link>
  )
}
