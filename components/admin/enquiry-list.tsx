'use client'

import { Check, Mail, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Enquiry } from '@/lib/enquiries/repo'

const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

// A contact that looks like an email or a phone number becomes a mailto: or tel: link.
function contactLink(contact: string) {
  if (/^\S+@\S+\.\S+$/.test(contact)) return { href: `mailto:${contact}`, Icon: Mail }
  const digits = contact.replace(/[^\d+]/g, '')
  if (digits.replace(/\D/g, '').length >= 7) return { href: `tel:${digits}`, Icon: Phone }
  return null
}

export function EnquiryList({ enquiries: initial }: { enquiries: Enquiry[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(e: Enquiry) {
    setBusy(e.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/enquiries/${e.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ read: !e.read }),
      })
      if (res.ok) {
        setItems((list) => list.map((x) => (x.id === e.id ? { ...x, read: !e.read } : x)))
        router.refresh()
      } else setError('Could not update the enquiry. Try again.')
    } catch {
      setError('Could not reach the server. Check your connection.')
    }
    setBusy(null)
  }

  if (items.length === 0) return <p className="text-muted-foreground">No enquiries yet. They appear here when someone sends the form on the site.</p>
  return (
    <>
      {error && <p role="alert" className="mb-4 text-sm font-medium text-destructive">{error}</p>}
      <ul className="grid gap-3">
        {items.map((e) => {
          const link = contactLink(e.contact)
          return (
            <li key={e.id} className={`rounded-lg border p-5 ${e.read ? 'border-border bg-field' : 'border-accent bg-field'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-lg font-bold">
                    {e.name}
                    {!e.read && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">New</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {when.format(new Date(e.createdAt))}
                    {e.bookTitle ? ` · About ${e.bookTitle}` : ''}
                  </p>
                </div>
                <Button type="button" variant="quiet" size="sm" disabled={busy === e.id} onClick={() => toggle(e)}>
                  {e.read ? 'Mark as new' : (<><Check aria-hidden="true" />Mark as read</>)}
                </Button>
              </div>
              <p className="mt-3 max-w-[70ch] whitespace-pre-line">{e.message}</p>
              <p className="mt-3 text-sm font-semibold">
                {link ? (
                  <a href={link.href} className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                    <link.Icon aria-hidden="true" className="size-4" />
                    {e.contact}
                  </a>
                ) : (
                  e.contact
                )}
              </p>
            </li>
          )
        })}
      </ul>
    </>
  )
}
