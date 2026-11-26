'use client'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LogoUpload } from './logo-upload'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

export function SeriesForm() {
  const signal = useAbortSignal()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setSaving(true)
    setFormError(null)
    setErrors({})
    try {
      const res = await fetch('/api/admin/series', {
        signal: signal(),
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: String(data.get('name') ?? ''), description: String(data.get('description') ?? ''), logoUrl }),
      })
      if (res.ok) {
        form.reset()
        setLogoUrl(null)
        router.refresh()
        toast.success('Series added.')
      } else {
        const body = await res.json().catch(() => null)
        setErrors(body?.fields ?? {})
        setFormError(body?.error ?? 'Could not save the series. Try again.')
        toast.error(body?.error ?? 'Could not save the series. Try again.')
      }
    } catch (err) {
      if (isAbort(err)) return
      setFormError('Could not reach the server. Check your connection.')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-lg border border-border bg-background p-6">
      <h2 className="text-lg font-bold">Add series</h2>
      <div>
        <Label htmlFor="series-name" className="mb-1.5 block">Series name</Label>
        <Input id="series-name" name="name" required maxLength={120} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? 'series-name-error' : undefined} />
        {errors.name && <p id="series-name-error" className="mt-1 text-sm font-medium text-destructive">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="series-description" className="mb-1.5 block">Description (optional)</Label>
        <Textarea id="series-description" name="description" maxLength={500} className="min-h-20" />
      </div>
      <div>
        <p className="mb-1.5 text-sm font-semibold">Brand logo (optional)</p>
        <LogoUpload value={logoUrl} onChange={setLogoUrl} />
      </div>
      {formError && <p role="alert" className="text-sm font-medium text-destructive">{formError}</p>}
      <div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving' : 'Add series'}</Button>
      </div>
    </form>
  )
}
