import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Learn N Grow home" className={cn('group inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', className)}>
      <Image src="/logo.png" alt="" width={2110} height={1110} className="h-[2.475rem] w-auto transition-transform duration-300 group-hover:-rotate-2 motion-reduce:transition-none" />
    </Link>
  )
}
