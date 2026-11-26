'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

export function LoginForm() {
  const signal = useAbortSignal()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        signal: signal(),
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      })
      if (res.ok) {
        // Full navigation so the admin layout renders with the new session.
        window.location.assign('/admin')
        return
      }
      setError((await res.json().catch(() => null))?.error ?? 'Could not sign in. Try again.')
    } catch (err) {
      if (isAbort(err)) return
      setError('Could not reach the server. Check your connection.')
    }
    setPending(false)
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <Label htmlFor="email" className="mb-1.5 block">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block">Password</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Signing in' : 'Sign in'}</Button>
    </form>
  )
}
