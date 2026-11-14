'use client'

import { ImageUp, LoaderCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Book } from '@/lib/books/types'
import { MAX_COVER_BYTES } from '@/lib/uploads/validate'

type Errors = Partial<Record<string, string>>

const str = (v: string | number | undefined | null) => (v === undefined || v === null ? '' : String(v))
const checkbox = 'size-4 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      {children}
      {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}

// aria props for a control whose Field may show a hint and an error.
const described = (id: string, errors: Errors, hint = false) => ({
  id,
  name: id,
  'aria-invalid': errors[id] ? true : undefined,
  'aria-describedby': [hint && `${id}-hint`, errors[id] && `${id}-error`].filter(Boolean).join(' ') || undefined,
})

export function BookForm({ book }: { book?: Book }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(book?.coverUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function onCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    setErrors((e) => ({ ...e, cover: undefined }))
    if (file.size > MAX_COVER_BYTES) {
      setErrors((e) => ({ ...e, cover: 'The image must be 5 MB or smaller.' }))
      input.value = ''
      return
    }
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.url) setCoverUrl(data.url)
      else setErrors((e) => ({ ...e, cover: data?.error ?? 'Could not upload the image. Try again.' }))
    } catch {
      setErrors((e) => ({ ...e, cover: 'Could not reach the server. Check your connection.' }))
    }
    input.value = ''
    setUploading(false)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (k: string) => String(data.get(k) ?? '').trim()
    const optional = (k: string) => value(k) || undefined
    const num = (k: string) => (value(k) === '' ? Number.NaN : Number(value(k)))
    const payload = {
      title: value('title'),
      subtitle: value('subtitle'),
      author: value('author'),
      slug: optional('slug'),
      subject: value('subject'),
      ageMin: num('ageMin'),
      ageMax: num('ageMax'),
      description: value('description'),
      coverUrl,
      coverAlt: value('coverAlt'),
      isbn: optional('isbn'),
      pages: value('pages') ? Number(value('pages')) : undefined,
      language: optional('language'),
      featured: data.get('featured') === 'on',
      published: data.get('published') === 'on',
    }

    setSaving(true)
    setFormError(null)
    try {
      const res = await fetch(book ? `/api/admin/books/${book.id}` : '/api/admin/books', {
        method: book ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push('/admin/books')
        router.refresh()
        return
      }
      const body = await res.json().catch(() => null)
      const fields: Errors = body?.fields ?? {}
      // A bad coverUrl is shown on the cover upload control.
      setErrors({ ...fields, cover: fields.coverUrl })
      setFormError(body?.error ?? 'Could not save the book. Try again.')
      const first = Object.keys(fields)[0]
      if (first) formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus()
    } catch {
      setFormError('Could not reach the server. Check your connection.')
    }
    setSaving(false)
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid content-start gap-8">
        <fieldset className="grid gap-5 border border-border bg-background p-6">
          <legend className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Details</legend>
          <Field id="title" label="Title" error={errors.title}>
            <Input {...described('title', errors)} defaultValue={book?.title} required maxLength={120} />
          </Field>
          <Field id="subtitle" label="Subtitle" error={errors.subtitle}>
            <Input {...described('subtitle', errors)} defaultValue={book?.subtitle} maxLength={240} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="author" label="Author" error={errors.author}>
              <Input {...described('author', errors)} defaultValue={book?.author} required maxLength={120} />
            </Field>
            <Field id="subject" label="Subject" error={errors.subject}>
              <Input {...described('subject', errors)} defaultValue={book?.subject} required maxLength={120} />
            </Field>
          </div>
          <Field
            id="slug"
            label="Slug"
            hint="The web address: /books/your-slug. Leave blank to make one from the title. Set it by hand for titles not written in English letters."
            error={errors.slug}
          >
            <Input {...described('slug', errors, true)} defaultValue={book?.slug} maxLength={120} spellCheck={false} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="ageMin" label="Youngest age" error={errors.ageMin}>
              <Input {...described('ageMin', errors)} type="number" inputMode="numeric" min={0} max={18} defaultValue={str(book?.ageMin ?? 3)} required />
            </Field>
            <Field id="ageMax" label="Oldest age" error={errors.ageMax}>
              <Input {...described('ageMax', errors)} type="number" inputMode="numeric" min={0} max={18} defaultValue={str(book?.ageMax ?? 8)} required />
            </Field>
          </div>
          <Field id="description" label="Description" error={errors.description}>
            <Textarea {...described('description', errors)} defaultValue={book?.description} maxLength={2000} rows={6} />
          </Field>
        </fieldset>

        <fieldset className="grid gap-5 border border-border bg-background p-6">
          <legend className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Publishing details</legend>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="isbn" label="ISBN (optional)" error={errors.isbn}>
              <Input {...described('isbn', errors)} defaultValue={book?.isbn} maxLength={32} />
            </Field>
            <Field id="pages" label="Pages (optional)" error={errors.pages}>
              <Input {...described('pages', errors)} type="number" inputMode="numeric" min={1} defaultValue={str(book?.pages)} />
            </Field>
            <Field id="language" label="Language (optional)" error={errors.language}>
              <Input {...described('language', errors)} defaultValue={book?.language} maxLength={60} />
            </Field>
          </div>
        </fieldset>
      </div>

      <div className="grid content-start gap-8">
        <fieldset className="grid gap-4 border border-border bg-background p-6">
          <legend className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cover</legend>
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-tint">
            {coverUrl ? (
              // Plain img: the preview must show the uploaded file as is.
              <img src={coverUrl} alt="Cover preview" className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
                <ImageUp aria-hidden="true" className="size-6" />
                No cover yet. The site shows a designed cover instead.
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70" role="status">
                <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-accent motion-reduce:animate-none" />
                <span className="sr-only">Uploading cover</span>
              </div>
            )}
          </div>
          <Field id="cover" label="Cover image" hint="JPEG, PNG or WebP, up to 5 MB." error={errors.cover}>
            <input
              {...described('cover', errors, true)}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onCoverChange}
              disabled={uploading}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:h-9 file:cursor-pointer file:border file:border-border file:bg-background file:px-3 file:font-semibold file:text-foreground hover:file:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </Field>
          {coverUrl && (
            <button
              type="button"
              onClick={() => setCoverUrl(null)}
              className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-muted-foreground hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X aria-hidden="true" className="size-4" />
              Remove cover
            </button>
          )}
          <Field id="coverAlt" label="Cover description" hint="For screen readers. Leave blank to use the title." error={errors.coverAlt}>
            <Input {...described('coverAlt', errors, true)} defaultValue={book?.coverAlt} maxLength={240} />
          </Field>
        </fieldset>

        <fieldset className="grid gap-3 border border-border bg-background p-6">
          <legend className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Visibility</legend>
          <div className="flex items-start gap-3">
            <input id="published" name="published" type="checkbox" defaultChecked={book?.published ?? true} className={`${checkbox} mt-0.5`} />
            <div>
              <Label htmlFor="published">Published</Label>
              <p className="text-sm text-muted-foreground">Shown on the site. Turn off to hide it.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input id="featured" name="featured" type="checkbox" defaultChecked={book?.featured ?? false} className={`${checkbox} mt-0.5`} />
            <div>
              <Label htmlFor="featured">Featured</Label>
              <p className="text-sm text-muted-foreground">Highlighted on the home page.</p>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6 lg:col-span-2">
        {formError && (
          <p role="alert" className="w-full text-sm font-medium text-destructive">{formError}</p>
        )}
        <Button type="submit" disabled={saving || uploading}>
          {saving ? 'Saving' : book ? 'Save changes' : 'Create book'}
        </Button>
        <Link href="/admin/books" className={buttonVariants({ variant: 'quiet' })}>Cancel</Link>
      </div>
    </form>
  )
}
