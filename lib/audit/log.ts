import { findAdminById } from '@/lib/auth/admins-repo'
import { clientIp } from '@/lib/request'
import { appendAudit, type AuditAction } from './repo'

type Target = { type: string; id?: string; label?: string }

// Best effort: a failed log write is reported on the server but never blocks the admin's action.
export async function audit(
  request: Request,
  actor: { adminId: string | null; email?: string },
  action: AuditAction,
  target?: Target,
): Promise<void> {
  try {
    const email = actor.email ?? (actor.adminId ? (await findAdminById(actor.adminId))?.email : undefined) ?? 'unknown'
    await appendAudit({
      actorId: actor.adminId,
      actorEmail: email,
      action,
      targetType: target?.type,
      targetId: target?.id,
      targetLabel: target?.label,
      ip: clientIp(request.headers),
    })
  } catch (err) {
    console.error('audit: could not record entry:', err instanceof Error ? err.message : 'unknown error')
  }
}
