'use client'

import { toast } from 'sonner'
import { ImageUp, LoaderCircle, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { MAX_COVER_BYTES } from '@/lib/uploads/validate'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

// Uploads through /api/admin/upload and reports the stored URL; the parent decides when to save it.
export function LogoUpload({ value, onChange, disabled }: { value: string | null; onChange: (url: string | null) => void; disabled?: boolean }) {
  const signal = useAbortSignal()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    setError(null)
    if (file.size > MAX_COVER_BYTES) {
      setError('The image must be 5 MB or smaller.')
      event.currentTarget.value = ''
      return
    }
    setBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/upload', { signal: signal(), method: 'POST', body })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.url) onChange(data.url)
      else {
        const msg = data?.error ?? 'Could not upload the image. Try again.'
        setError(msg)
        toast.error(msg)
      }
    } catch (err) {
      if (isAbort(err)) return
      setError('Could not reach the server. Check your connection.')
      toast.error('Could not reach the server. Check your connection.')
    }
    if (input.current) input.current.value = ''
    setBusy(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-border bg-background p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of a just-uploaded file */}
          {value ? <img src={value} alt="Series logo" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted-foreground">No logo</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3.5 text-sm font-semibold hover:border-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
            {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <ImageUp aria-hidden="true" className="size-4" />}
            {value ? 'Change logo' : 'Upload logo'}
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} disabled={busy || disabled} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange(null)} disabled={busy || disabled} className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <X aria-hidden="true" className="size-4" />
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
