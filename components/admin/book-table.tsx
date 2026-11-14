'use client'

import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ageLabel } from '@/lib/books/format'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from './confirm-dialog'

type Flag = 'published' | 'featured'

const iconButton =
  'inline-flex size-9 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

function Toggle({ on, label, busy, onClick }: { on: boolean; label: string; busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={onClick}
      className="relative inline-flex h-6 w-11 shrink-0 items-center border border-foreground/20 bg-tint transition-colors aria-checked:border-accent aria-checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
    >
      <span className={cn('size-4 bg-background shadow-sm transition-transform duration-150 ease-out', on ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  )
}

export function BookTable({ books: initial }: { books: Book[] }) {
  const [books, setBooks] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Book | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function toggle(book: Book, flag: Flag) {
    setBusy(book.id)
    setError(null)
    try {
      // PATCH takes the whole BookInput; the server ignores id and timestamps.
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...book, [flag]: !book[flag] }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.book) throw new Error(data?.error)
      setBooks((list) => list.map((b) => (b.id === book.id ? data.book : b)))
    } catch (e) {
      setError(`Could not update "${book.title}". ${(e as Error).message || 'Try again.'}`)
    }
    setBusy(null)
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(deleting.id)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/books/${deleting.id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 404) throw new Error((await res.json().catch(() => null))?.error)
      const id = deleting.id
      setBooks((list) => list.filter((b) => b.id !== id))
      setDeleting(null)
    } catch (e) {
      setDeleteError((e as Error).message || 'Could not delete the book. Try again.')
    }
    setBusy(null)
  }

  if (books.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-16 text-center">
        <p className="font-semibold text-foreground">No books yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">Add the first title to start the catalogue.</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {/* relative: keeps the sr-only header spans inside the scroller, not widening the page */}
      <div className="relative overflow-x-auto border border-border bg-background">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-border bg-tint/50 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="w-16 px-4 py-3"><span className="sr-only">Cover</span></th>
              <th scope="col" className="px-4 py-3">Title</th>
              <th scope="col" className="px-4 py-3">Subject</th>
              <th scope="col" className="px-4 py-3">Ages</th>
              <th scope="col" className="px-4 py-3">Published</th>
              <th scope="col" className="px-4 py-3">Featured</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {books.map((book) => (
              <tr key={book.id} className={cn('transition-colors hover:bg-tint/30', busy === book.id && 'opacity-60')}>
                <td className="px-4 py-3">
                  {book.coverUrl ? (
                    // Plain img: an admin thumbnail does not need next/image resizing.
                    <img src={book.coverUrl} alt="" loading="lazy" className="aspect-[3/4] w-10 border border-border object-cover" />
                  ) : (
                    <span aria-hidden="true" className="flex aspect-[3/4] w-10 items-center justify-center bg-tint text-sm font-extrabold text-muted-foreground">
                      {book.title.slice(0, 1)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="font-semibold text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {book.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{book.author}</p>
                </td>
                <td className="px-4 py-3 text-foreground">{book.subject}</td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">{ageLabel(book.ageMin, book.ageMax)}</td>
                <td className="px-4 py-3">
                  <Toggle on={book.published} label={`Published: ${book.title}`} busy={busy === book.id} onClick={() => toggle(book, 'published')} />
                </td>
                <td className="px-4 py-3">
                  <Toggle on={book.featured} label={`Featured: ${book.title}`} busy={busy === book.id} onClick={() => toggle(book, 'featured')} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/books/${book.id}`} aria-label={`Edit ${book.title}`} className={iconButton}>
                      <Pencil aria-hidden="true" className="size-4" />
                    </Link>
                    <button
                      type="button"
                      aria-label={`Delete ${book.title}`}
                      onClick={() => {
                        setDeleteError(null)
                        setDeleting(book)
                      }}
                      className={cn(iconButton, 'hover:text-destructive')}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && busy === null && setDeleting(null)}
        title={`Delete "${deleting?.title ?? ''}"?`}
        description="The book is removed from the site straight away. Enquiries and visit records that mention it keep its title. This cannot be undone. To take it off the site for now, turn Published off instead."
        confirmLabel="Delete book"
        onConfirm={confirmDelete}
        pending={busy !== null}
        error={deleteError}
      />
    </>
  )
}
