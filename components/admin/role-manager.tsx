'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CustomRole } from '@/lib/auth/roles-repo'
import { AREA_LABEL, GRANTABLE, levelsFor, noAccess, summarize, WRITE_MEANS, type Level, type Permissions } from '@/lib/auth/roles'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

// Loaded on first use: the dialog code is not needed until someone clicks Delete.
const ConfirmDialog = dynamic(() => import('./confirm-dialog').then((m) => m.ConfirmDialog))

const NETWORK = 'Could not reach the server. Check your connection.'
const LEVEL_LABEL: Record<Level, string> = { none: 'No access', read: 'Read only', write: 'Read and write' }
const select =
  'h-9 rounded-md border border-input bg-field px-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

type Builtin = { key: string; label: string; summary: string }

function RoleForm({ initial, onSaved, onCancel }: { initial?: CustomRole; onSaved: (r: CustomRole) => void; onCancel?: () => void }) {
  const signal = useAbortSignal()
  const [name, setName] = useState(initial?.name ?? '')
  const [perms, setPerms] = useState<Permissions>(initial?.permissions ?? noAccess())
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    // users is never sent: custom roles cannot manage users or roles.
    const permissions = Object.fromEntries(GRANTABLE.map((a) => [a, perms[a]]))
    try {
      const res = await fetch(initial ? `/api/admin/roles/${initial.id}` : '/api/admin/roles', {
        signal: signal(),
        method: initial ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, permissions }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        toast.success(initial ? 'Role saved.' : 'Role added.')
        onSaved(data.role)
        if (!initial) {
          setName('')
          setPerms(noAccess())
        }
      } else {
        setErrors(data?.fields ?? {})
        toast.error(data?.error ?? 'Could not save the role.')
      }
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setSaving(false)
  }

  const id = initial?.id ?? 'new'
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div>
        <Label htmlFor={`role-name-${id}`} className="mb-1.5 block">Role name</Label>
        <Input id={`role-name-${id}`} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required placeholder="Auditor, Content writer" />
        {errors.name && <p className="mt-1 text-sm font-medium text-destructive">{errors.name}</p>}
      </div>
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-semibold">What this role can do</legend>
        {GRANTABLE.map((a) => (
          <div key={a} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <label htmlFor={`${id}-${a}`} className="text-sm">
              <span className="font-medium">{AREA_LABEL[a]}</span>
              {WRITE_MEANS[a] && <span className="block text-xs text-muted-foreground">Write: {WRITE_MEANS[a]}</span>}
            </label>
            <select id={`${id}-${a}`} className={select} value={perms[a]} onChange={(e) => setPerms({ ...perms, [a]: e.target.value as Level })}>
              {levelsFor(a).map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABEL[l]}
                </option>
              ))}
            </select>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">Every role can open the dashboard and change its own password. Users and roles stay with the owner.</p>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving' : initial ? 'Save role' : 'Add role'}</Button>
        {onCancel && <Button type="button" variant="quiet" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}

export function RoleManager({ initial, builtin }: { initial: CustomRole[]; builtin: Builtin[] }) {
  const signal = useAbortSignal()
  const router = useRouter()
  const [roles, setRoles] = useState(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<CustomRole | null>(null)
  const [busy, setBusy] = useState(false)

  const saved = (r: CustomRole) => {
    setRoles((list) => (list.some((x) => x.id === r.id) ? list.map((x) => (x.id === r.id ? r : x)) : [...list, r].sort((a, b) => a.name.localeCompare(b.name))))
    setEditing(null)
    router.refresh()
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/roles/${deleting.id}`, { signal: signal(), method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        const id = deleting.id
        setRoles((list) => list.filter((x) => x.id !== id))
        toast.success('Role deleted.')
        router.refresh()
      } else toast.error(data?.error ?? 'Could not delete the role.')
      setDeleting(null)
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setBusy(false)
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="grid content-start gap-6">
        <section aria-labelledby="builtin-heading">
          <h2 id="builtin-heading" className="mb-3 font-bold">Built-in roles</h2>
          <ul className="grid gap-3">
            {builtin.map((b) => (
              <li key={b.key} className="rounded-lg border border-border bg-field p-5">
                <p className="font-semibold">{b.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="custom-heading">
          <h2 id="custom-heading" className="mb-3 font-bold">Your roles</h2>
          <ul className="grid gap-3">
            {roles.length === 0 && <li className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-muted-foreground">No custom roles yet. Add one on the right.</li>}
            {roles.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-background p-5">
                {editing === r.id ? (
                  <RoleForm initial={r} onSaved={saved} onCancel={() => setEditing(null)} />
                ) : (
                  <>
                    <p className="font-semibold">{r.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{summarize(r.permissions)}</p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="quiet" onClick={() => setEditing(r.id)}>Edit</Button>
                      <Button size="sm" variant="quiet" onClick={() => setDeleting(r)}>Delete</Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="h-fit rounded-lg border border-border bg-background p-5 xl:sticky xl:top-6">
        <h2 className="mb-4 text-lg font-bold">Add role</h2>
        <RoleForm onSaved={saved} />
      </div>

      {deleting && (
        <ConfirmDialog
          open={deleting !== null}
          onOpenChange={(open) => !open && !busy && setDeleting(null)}
          title={`Delete the ${deleting.name} role?`}
          description="A role that still has users cannot be deleted: move them to another role first. This cannot be undone."
          confirmLabel="Delete role"
          onConfirm={confirmDelete}
          pending={busy}
        />
      )}
    </div>
  )
}
