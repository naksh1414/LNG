'use client'

import { toast } from 'sonner'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

export function PasswordForm() {
  const signal = useAbortSignal()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    if (form.get('newPassword') !== form.get('confirmPassword')) {
      setMessage({ ok: false, text: 'The new passwords do not match.' })
      return
    }
    setPending(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/password', {
        signal: signal(),
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.get('currentPassword'), newPassword: form.get('newPassword') }),
      })
      if (res.ok) {
        formEl.reset()
        setMessage({ ok: true, text: 'Password changed.' })
        toast.success('Password changed.')
      } else {
        const msg = (await res.json().catch(() => null))?.error ?? 'Could not change the password.'
        setMessage({ ok: false, text: msg })
        toast.error(msg)
      }
    } catch (err) {
      if (isAbort(err)) return
      setMessage({ ok: false, text: 'Could not reach the server. Check your connection.' })
    }
    setPending(false)
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-sm gap-5">
      <div>
        <Label htmlFor="currentPassword" className="mb-1.5 block">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div>
        <Label htmlFor="newPassword" className="mb-1.5 block">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={10} required aria-describedby="newPassword-hint" />
        <p id="newPassword-hint" className="mt-1 text-sm text-muted-foreground">At least 10 characters.</p>
      </div>
      <div>
        <Label htmlFor="confirmPassword" className="mb-1.5 block">Repeat new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </div>
      {message && (
        <p role={message.ok ? 'status' : 'alert'} className={`text-sm font-medium ${message.ok ? 'text-foreground' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? 'Saving' : 'Change password'}
      </Button>
    </form>
  )
}
