import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookForm } from '@/components/admin/book-form'
import { requireAdminPage } from '@/lib/auth/require-admin'

export const metadata: Metadata = { title: 'Add book' }

export default async function NewBookPage() {
  await requireAdminPage()
  return (
    <>
      <Link
        href="/admin/books"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All books
      </Link>
      <h1 className="mb-8 text-3xl font-extrabold tracking-[-0.03em] text-foreground">Add book</h1>
      <BookForm />
    </>
  )
}
