'use client'

import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'

// Covers the catalogue and book pages when the database is unreachable. No details are shown.
export default function ErrorView({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-24">
        <h1 className="text-4xl font-bold">We could not load the books right now.</h1>
        <p className="mt-3 max-w-prose text-muted-foreground">Please try again in a moment.</p>
        <Button type="button" className="mt-8" onClick={reset}>
          Try again
        </Button>
      </main>
    </>
  )
}
