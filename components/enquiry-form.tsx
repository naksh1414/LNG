'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sendEvent } from '@/components/analytics-tracker'
import { LIMITS } from '@/lib/enquiries/limits'
import { buildWhatsAppUrl } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'

type Props = { book?: { id: string; title: string } }
type FieldName = 'name' | 'contact' | 'message'
type Errors = Partial<Record<FieldName, string>>
type Result = { saved: boolean; whatsapp: string | null; blocked: boolean }

const errorClass = 'mt-1 text-sm text-destructive'

export function EnquiryForm({ book }: Props) {
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLParagraphElement>(null)

  // The submit button unmounts on success, so move focus to the outcome.
  useEffect(() => {
    if (result) resultRef.current?.focus()
  }, [result])
  useEffect(() => {
    if (failed) alertRef.current?.focus()
  }, [failed])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const value = (k: string) => String(data.get(k) ?? '').trim()
    const name = value('name')
    const contact = value('contact')
    const message = value('message')

    const next: Errors = {}
    if (name.length < LIMITS.name.min) next.name = 'Enter your name.'
    if (contact.length < LIMITS.contact.min) next.contact = 'Enter a phone number or email.'
    if (message.length < LIMITS.message.min) next.message = 'Enter a message.'
    setErrors(next)
    const firstInvalid = (['name', 'contact', 'message'] as const).find((f) => next[f])
    if (firstInvalid) return form.querySelector<HTMLElement>(`#enquiry-${firstInvalid}`)?.focus()

    // Open the window now, inside the user gesture; browsers block window.open after an await.
    const whatsapp = buildWhatsAppUrl(site.whatsappNumber, { name, contact, message, bookTitle: book?.title })
    const win = whatsapp ? window.open('about:blank', '_blank') : null

    setSending(true)
    setFailed(false)
    let saved = false
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, contact, message, bookId: book?.id, website: value('website') }),
      })
      saved = res.ok
    } catch {
      saved = false
    }
    setSending(false)
    if (saved) sendEvent({ type: 'enquiry_sent', bookId: book?.id })

    if (win && whatsapp) {
      try {
        win.location.href = whatsapp
        win.opener = null
      } catch {
        // Best effort: the window is already navigating.
      }
    }
    if (!saved && !whatsapp) return setFailed(true)
    setResult({ saved, whatsapp, blocked: Boolean(whatsapp) && !win })
  }

  if (result) {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="border border-border p-5 focus-visible:outline-2 focus-visible:outline-accent">
        <p className="font-semibold">
          {result.saved
            ? 'Your enquiry was saved. We will contact you.'
            : 'We could not save your enquiry, but you can still reach us on WhatsApp.'}
        </p>
        {result.whatsapp && (
          <a
            href={result.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={
              result.blocked
                ? buttonVariants({ className: 'mt-4' })
                : 'mt-2 inline-block text-sm font-semibold text-foreground underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
            }
          >
            Open WhatsApp
          </a>
        )}
      </div>
    )
  }

  // Prefixed ids: the home page also has section#contact.
  const field = (id: FieldName) => ({
    id: `enquiry-${id}`,
    name: id,
    'aria-invalid': errors[id] ? true : undefined,
    'aria-describedby': errors[id] ? `enquiry-${id}-error` : undefined,
  })

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      {book && <p className="text-sm text-muted-foreground">About: {book.title}</p>}
      <div>
        <Label htmlFor="enquiry-name" className="mb-1.5 block">Your name</Label>
        <Input {...field('name')} autoComplete="name" maxLength={LIMITS.name.max} />
        {errors.name && <p id="enquiry-name-error" className={errorClass}>{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="enquiry-contact" className="mb-1.5 block">Phone or email</Label>
        <Input {...field('contact')} autoComplete="email" maxLength={LIMITS.contact.max} />
        {errors.contact && <p id="enquiry-contact-error" className={errorClass}>{errors.contact}</p>}
      </div>
      <div>
        <Label htmlFor="enquiry-message" className="mb-1.5 block">Message</Label>
        <Textarea {...field('message')} maxLength={LIMITS.message.max} />
        {errors.message && <p id="enquiry-message-error" className={errorClass}>{errors.message}</p>}
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {failed && (
        <p ref={alertRef} tabIndex={-1} role="alert" className="text-sm font-medium text-destructive">
          We could not send your enquiry. Check your connection and try again.
        </p>
      )}
      <div>
        <Button type="submit" disabled={sending}>{sending ? 'Sending' : 'Send enquiry'}</Button>
      </div>
    </form>
  )
}
