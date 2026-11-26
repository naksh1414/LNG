'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PublicAdmin } from '@/lib/auth/public-admin'
import type { RoleOption } from '@/lib/auth/roles'
import { isAbort, useAbortSignal } from '@/lib/use-abort-signal'

// Loaded on first use: the dialog code is not needed until someone clicks Delete.
const ConfirmDialog = dynamic(() => import('./confirm-dialog').then((m) => m.ConfirmDialog))

const NETWORK = 'Could not reach the server. Check your connection.'
const select =
  'h-9 rounded-md border border-input bg-field px-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60'

export function UserManager({ initial, meId, roles }: { initial: PublicAdmin[]; meId: string; roles: RoleOption[] }) {
  const signal = useAbortSignal()
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [role, setRole] = useState(roles.find((r) => r.key === 'editor')?.key ?? roles[0].key)
  const label = (key: string) => roles.find((r) => r.key === key)?.label ?? 'No role'
  const [resetting, setResetting] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<PublicAdmin | null>(null)

  async function call(url: string, method: string, body?: unknown) {
    const res = await fetch(url, { signal: signal(), method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
    return { ok: res.ok, data: await res.json().catch(() => null) }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const d = new FormData(form)
    setBusy('new')
    setErrors({})
    try {
      const { ok, data } = await call('/api/admin/users', 'POST', { email: String(d.get('email') ?? ''), password: String(d.get('password') ?? ''), role })
      if (ok) {
        setUsers((list) => [...list, data.user])
        form.reset()
        toast.success('User added. Share the password with them privately.')
        router.refresh()
      } else {
        setErrors(data?.fields ?? {})
        toast.error(data?.error ?? 'Could not add the user.')
      }
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setBusy(null)
  }

  async function change(u: PublicAdmin, changes: { role?: string; active?: boolean }, message: string) {
    setBusy(u.id)
    try {
      const { ok, data } = await call(`/api/admin/users/${u.id}`, 'PATCH', changes)
      if (ok) {
        setUsers((list) => list.map((x) => (x.id === u.id ? data.user : x)))
        toast.success(message)
        router.refresh()
      } else toast.error(data?.error ?? 'Could not update the user.')
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setBusy(null)
  }

  async function reset(event: FormEvent<HTMLFormElement>, u: PublicAdmin) {
    event.preventDefault()
    const password = String(new FormData(event.currentTarget).get('password') ?? '')
    setBusy(u.id)
    try {
      const { ok, data } = await call(`/api/admin/users/${u.id}`, 'PATCH', { password })
      if (ok) {
        setResetting(null)
        toast.success(`Password reset for ${u.email}.`)
      } else toast.error(data?.error ?? 'Could not reset the password.')
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
      const { ok, data } = await call(`/api/admin/users/${deleting.id}`, 'DELETE')
      if (ok) {
        const id = deleting.id
        setUsers((list) => list.filter((x) => x.id !== id))
        setDeleting(null)
        toast.success('User deleted.')
        router.refresh()
      } else toast.error(data?.error ?? 'Could not delete the user.')
    } catch (err) {
      if (isAbort(err)) return
      toast.error(NETWORK)
    }
    setBusy(null)
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-sm font-medium text-destructive">{errors[k]}</p>

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <ul className="grid content-start gap-3">
        {users.map((u) => {
          const me = u.id === meId
          return (
            <li key={u.id} className="rounded-lg border border-border bg-background p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0">
                  <span className="block truncate font-semibold">{u.email}</span>
                  <span className="text-sm text-muted-foreground">{me ? 'You' : u.active ? 'Active' : 'Turned off'}</span>
                </p>
                <label className="flex items-center gap-2 text-sm font-medium">
                  Role
                  <select
                    className={select}
                    value={u.role}
                    disabled={me || busy === u.id}
                    onChange={(e) => change(u, { role: e.target.value }, `${u.email} is now ${label(e.target.value)}.`)}
                  >
                    {!roles.some((r) => r.key === u.role) && <option value={u.role}>No role</option>}
                    {roles.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!me && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="quiet" disabled={busy === u.id} onClick={() => change(u, { active: !u.active }, u.active ? 'User turned off.' : 'User turned on.')}>
                    {u.active ? 'Turn off' : 'Turn on'}
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => setResetting(resetting === u.id ? null : u.id)}>
                    Reset password
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => setDeleting(u)}>
                    Delete
                  </Button>
                </div>
              )}
              {resetting === u.id && (
                <form onSubmit={(e) => reset(e, u)} className="mt-4 flex flex-wrap items-end gap-2">
                  <div>
                    <Label htmlFor={`reset-${u.id}`} className="mb-1.5 block">New password</Label>
                    <Input id={`reset-${u.id}`} name="password" type="text" autoComplete="off" minLength={10} required className="w-64" />
                  </div>
                  <Button type="submit" size="sm" disabled={busy === u.id}>Save password</Button>
                </form>
              )}
            </li>
          )
        })}
      </ul>

      <form onSubmit={add} noValidate className="grid h-fit content-start gap-4 rounded-lg border border-border bg-background p-5 xl:sticky xl:top-6">
        <h2 className="text-lg font-bold">Add user</h2>
        <div>
          <Label htmlFor="u-email" className="mb-1.5 block">Email</Label>
          <Input id="u-email" name="email" type="email" autoComplete="off" required maxLength={254} />
          {err('email')}
        </div>
        <div>
          <Label htmlFor="u-role" className="mb-1.5 block">Role</Label>
          <select id="u-role" className={`${select} w-full`} value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-muted-foreground">{roles.find((r) => r.key === role)?.hint}</p>
          {err('role')}
        </div>
        <div>
          <Label htmlFor="u-password" className="mb-1.5 block">Starting password</Label>
          <Input id="u-password" name="password" type="text" autoComplete="off" required minLength={10} />
          <p className="mt-1 text-sm text-muted-foreground">At least 10 characters. They can change it after signing in.</p>
          {err('password')}
        </div>
        <Button type="submit" disabled={busy === 'new'} className="justify-self-start">{busy === 'new' ? 'Adding' : 'Add user'}</Button>
      </form>

      {deleting && (
        <ConfirmDialog
          open={deleting !== null}
          onOpenChange={(open) => !open && busy === null && setDeleting(null)}
          title={`Delete ${deleting.email}?`}
          description="They can no longer sign in. Their past actions stay in the audit log. This cannot be undone. To block them for now, use Turn off instead."
          confirmLabel="Delete user"
          onConfirm={confirmDelete}
          pending={busy !== null}
        />
      )}
    </div>
  )
}
