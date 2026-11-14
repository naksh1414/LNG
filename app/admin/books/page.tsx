import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookTable } from '@/components/admin/book-table'
import { buttonVariants } from '@/components/ui/button'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { listAllBooks } from '@/lib/books/repo'

export const metadata: Metadata = { title: 'Books' }
export const dynamic = 'force-dynamic'

export default async function AdminBooksPage() {
  await requireAdminPage()
  const books = await listAllBooks()
  const live = books.filter((b) => b.published).length
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Books</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? 'title' : 'titles'}, {live} published
          </p>
        </div>
        <Link href="/admin/books/new" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Add book
        </Link>
      </div>
      <BookTable books={books} />
    </>
  )
}
