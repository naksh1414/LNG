'use client'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogoUpload } from './logo-upload'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

export function SeriesLogoEditor({ slug, logoUrl }: { slug: string; logoUrl: string | null }) {
  const signal = useAbortSignal()
  const router = useRouter()
  const [url, setUrl] = useState(logoUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(next: string | null) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/series/${slug}`, {
        signal: signal(),
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ logoUrl: next }),
      })
      if (res.ok) {
        setUrl(next)
        router.refresh()
        toast.success(next ? 'Logo updated.' : 'Logo removed.')
      } else {
        const msg = (await res.json().catch(() => null))?.error ?? 'Could not save the logo. Try again.'
        setError(msg)
        toast.error(msg)
      }
    } catch (err) {
      if (isAbort(err)) return
      setError('Could not reach the server. Check your connection.')
      toast.error('Could not reach the server. Check your connection.')
    }
    setSaving(false)
  }

  return (
    <section aria-labelledby="logo-heading" className="mb-8 rounded-lg border border-border bg-field p-5">
      <h2 id="logo-heading" className="mb-3 font-bold">Brand logo</h2>
      <LogoUpload value={url} onChange={save} disabled={saving} />
      {error && <p role="alert" className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </section>
  )
}
