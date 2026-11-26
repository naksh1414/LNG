'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Testimonial } from '@/lib/testimonials/repo'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

// Loaded on first use: the dialog code is not needed until someone clicks Delete.
const ConfirmDialog = dynamic(() => import('./confirm-dialog').then((m) => m.ConfirmDialog))

const NETWORK = 'Could not reach the server. Check your connection.'

async function send(signal: AbortSignal | undefined, url: string, method: string, body?: unknown) {
  const res = await fetch(url, { signal, method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
  const data = await res.json().catch(() => null)
  return { ok: res.ok, data }
}

export function TestimonialManager({ initial, readOnly = false }: { initial: Testimonial[]; readOnly?: boolean }) {
  const signal = useAbortSignal()
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<Testimonial | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const d = new FormData(form)
    const payload = {
      quote: String(d.get('quote') ?? ''),
      name: String(d.get('name') ?? ''),
      role: String(d.get('role') ?? ''),
      published: d.get('published') === 'on',
    }
    setSaving(true)
    setErrors({})
    try {
      const { ok, data } = editing ? await send(signal(), `/api/admin/testimonials/${editing.id}`, 'PATCH', payload) : await send(signal(), '/api/admin/testimonials', 'POST', payload)
      if (ok) {
        setItems((list) => (editing ? list.map((x) => (x.id === editing.id ? data.testimonial : x)) : [data.testimonial, ...list]))
        toast.success(editing ? 'Testimonial saved.' : 'Testimonial added.')
        setEditing(null)
        form.reset()
        router.refresh()
      } else {
        setErrors(data?.fields ?? {})
        toast.error(data?.error ?? 'Could not save the testimonial. Try again.')
      }
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setSaving(false)
  }

  async function togglePublished(t: Testimonial) {
    setBusy(t.id)
    try {
      const { ok, data } = await send(signal(), `/api/admin/testimonials/${t.id}`, 'PATCH', { published: !t.published })
      if (ok) {
        setItems((list) => list.map((x) => (x.id === t.id ? data.testimonial : x)))
        toast.success(t.published ? 'Hidden from the site.' : 'Published on the site.')
        router.refresh()
      } else toast.error(data?.error ?? 'Could not update the testimonial.')
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setBusy(null)
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(deleting.id)
    try {
      const { ok, data } = await send(signal(), `/api/admin/testimonials/${deleting.id}`, 'DELETE')
      if (ok) {
        const id = deleting.id
        setItems((list) => list.filter((x) => x.id !== id))
        if (editing?.id === id) setEditing(null)
        setDeleting(null)
        toast.success('Testimonial deleted.')
        router.refresh()
      } else toast.error(data?.error ?? 'Could not delete the testimonial.')
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setBusy(null)
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-sm font-medium text-destructive">{errors[k]}</p>

  return (
    <div className={`grid gap-8 ${readOnly ? '' : 'lg:grid-cols-[minmax(0,1fr)_22rem]'}`}>
      <ul className="grid content-start gap-3">
        {items.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
            No testimonials yet. Add the first one.
          </li>
        )}
        {items.map((t) => (
          <li key={t.id} className="rounded-lg border border-border bg-background p-5">
            <blockquote className="leading-relaxed">“{t.quote}”</blockquote>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{t.name}</span>
              {t.role && `, ${t.role}`}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.published ? 'bg-accent text-accent-foreground' : 'bg-border text-foreground'}`}>
                {t.published ? 'Published' : 'Hidden'}
              </span>
              {!readOnly && (
                <>
                  <Button size="sm" variant="quiet" disabled={busy === t.id} onClick={() => togglePublished(t)}>
                    {t.published ? 'Hide' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => { setEditing(t); setErrors({}) }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => setDeleting(t)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* key remounts the form with the chosen testimonial's values, or empty for a new one. */}
      {!readOnly && (
      <form key={editing?.id ?? 'new'} onSubmit={onSubmit} noValidate className="grid h-fit content-start gap-4 rounded-lg border border-border bg-background p-5 lg:sticky lg:top-6">
        <h2 className="text-lg font-bold">{editing ? 'Edit testimonial' : 'Add testimonial'}</h2>
        <div>
          <Label htmlFor="t-quote" className="mb-1.5 block">Quote</Label>
          <Textarea id="t-quote" name="quote" required maxLength={400} defaultValue={editing?.quote} className="min-h-28" />
          {err('quote')}
        </div>
        <div>
          <Label htmlFor="t-name" className="mb-1.5 block">Name</Label>
          <Input id="t-name" name="name" required maxLength={80} defaultValue={editing?.name} />
          {err('name')}
        </div>
        <div>
          <Label htmlFor="t-role" className="mb-1.5 block">Role (optional)</Label>
          <Input id="t-role" name="role" maxLength={80} defaultValue={editing?.role} placeholder="Parent, Teacher, School name" />
          {err('role')}
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={editing ? editing.published : true} className="size-4 accent-[var(--accent)]" />
          Show on the home page
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving' : editing ? 'Save changes' : 'Add testimonial'}</Button>
          {editing && <Button type="button" variant="quiet" onClick={() => { setEditing(null); setErrors({}) }}>Cancel</Button>}
        </div>
      </form>
      )}

      {deleting && (
        <ConfirmDialog
          open={deleting !== null}
          onOpenChange={(open) => !open && busy === null && setDeleting(null)}
          title={`Delete the testimonial from ${deleting?.name ?? ''}?`}
          description="It is removed from the site straight away. This cannot be undone. To hide it for now, use Hide instead."
          confirmLabel="Delete testimonial"
          onConfirm={confirmDelete}
          pending={busy !== null}
        />
      )}
    </div>
  )
}
