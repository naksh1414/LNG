'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildWhatsAppUrl } from '@/lib/enquiries/whatsapp'
import { site } from '@/lib/site'

type Props = { book?: { id: string; title: string } }
type Errors = Partial<Record<'name' | 'contact' | 'message', string>>
type Result = { saved: boolean; whatsapp: string | null } | null

const errorClass = 'mt-1 text-sm text-destructive'

export function EnquiryForm({ book }: Props) {
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [result, setResult] = useState<Result>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (k: string) => String(data.get(k) ?? '').trim()
    const name = value('name')
    const contact = value('contact')
    const message = value('message')

    const next: Errors = {}
    if (!name) next.name = 'Enter your name.'
    if (contact.length < 3) next.contact = 'Enter a phone number or email.'
    if (!message) next.message = 'Enter a message.'
    setErrors(next)
    if (Object.keys(next).length) return

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

    const whatsapp = buildWhatsAppUrl(site.whatsappNumber, { name, contact, message, bookTitle: book?.title })
    if (whatsapp) window.open(whatsapp, '_blank', 'noopener,noreferrer')
    if (!saved && !whatsapp) return setFailed(true)
    setResult({ saved, whatsapp })
  }

  if (result) {
    return (
      <div role="status" className="border border-border p-5">
        <p className="font-semibold">
          {result.saved ? 'Your enquiry was saved. We will contact you.' : 'We could not save your enquiry, but WhatsApp is open.'}
        </p>
        {result.whatsapp && (
          <p className="mt-2 text-sm text-muted-foreground">
            WhatsApp did not open?{' '}
            <a href={result.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline underline-offset-2">
              Open WhatsApp
            </a>
          </p>
        )}
      </div>
    )
  }

  const field = (id: keyof Errors) => ({
    id,
    name: id,
    'aria-invalid': errors[id] ? true : undefined,
    'aria-describedby': errors[id] ? `${id}-error` : undefined,
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {book && <p className="text-sm text-muted-foreground">About: {book.title}</p>}
      <div>
        <Label htmlFor="name" className="mb-1.5 block">Your name</Label>
        <Input {...field('name')} autoComplete="name" maxLength={100} />
        {errors.name && <p id="name-error" className={errorClass}>{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="contact" className="mb-1.5 block">Phone or email</Label>
        <Input {...field('contact')} autoComplete="email" maxLength={120} />
        {errors.contact && <p id="contact-error" className={errorClass}>{errors.contact}</p>}
      </div>
      <div>
        <Label htmlFor="message" className="mb-1.5 block">Message</Label>
        <Textarea {...field('message')} maxLength={2000} />
        {errors.message && <p id="message-error" className={errorClass}>{errors.message}</p>}
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {failed && (
        <p role="alert" className="text-sm font-medium text-destructive">
          We could not send your enquiry. Check your connection and try again.
        </p>
      )}
      <div>
        <Button type="submit" disabled={sending}>{sending ? 'Sending' : 'Send enquiry'}</Button>
      </div>
    </form>
  )
}
