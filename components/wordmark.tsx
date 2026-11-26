import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Learn N Grow home" className={cn('group inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', className)}>
      {/* 190x100 is 2x the 50px header height: the browser fetches a small file, not the 2110px original. */}
      <Image src="/logo.png" alt="" width={190} height={100} className="h-[2.475rem] w-auto transition-transform duration-300 group-hover:-rotate-2 motion-reduce:transition-none" />
    </Link>
  )
}
