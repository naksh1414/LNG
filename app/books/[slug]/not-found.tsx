import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function BookNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-24">
        <h1 className="text-4xl font-bold">We could not find that book</h1>
        <p className="mt-3 max-w-prose text-muted-foreground">It may have been renamed or is no longer listed.</p>
        <Link href="/catalog" className={cn(buttonVariants(), 'mt-8')}>
          Browse all books
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
