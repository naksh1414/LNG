import { createHash } from 'node:crypto'
import { getDb } from '@/lib/db/mongo'

export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | 'series_created'
  | 'series_logo_changed'
  | 'book_created'
  | 'book_updated'
  | 'book_deleted'
  | 'testimonial_created'
  | 'testimonial_updated'
  | 'testimonial_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_password_reset'
  | 'user_deleted'
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'

export type AuditEntry = {
  seq: number
  at: Date
  actorId: string | null
  actorEmail: string
  action: AuditAction
  targetType: string | null
  targetId: string | null
  targetLabel: string | null
  ip: string | null
  prevHash: string
  hash: string
}

export type AuditInput = Partial<Pick<AuditEntry, 'actorId' | 'targetType' | 'targetId' | 'targetLabel' | 'ip'>> &
  Pick<AuditEntry, 'actorEmail' | 'action'>

const GENESIS = '0'.repeat(64)

// Each entry's hash covers the previous hash, so changing, removing or inserting any row breaks every hash after it.
const hashOf = (prev: string, e: Omit<AuditEntry, 'prevHash' | 'hash'>) =>
  createHash('sha256')
    .update(
      prev +
        JSON.stringify([e.seq, e.at.toISOString(), e.actorId, e.actorEmail, e.action, e.targetType, e.targetId, e.targetLabel, e.ip]),
    )
    .digest('hex')

// The only writer. There is deliberately no update or delete function, and no route that calls one.
async function col() {
  const c = (await getDb()).collection<AuditEntry>('audit_log')
  await c.createIndex({ seq: 1 }, { unique: true })
  return c
}

export async function appendAudit(input: AuditInput): Promise<void> {
  const c = await col()
  for (let attempt = 1; ; attempt++) {
    const last = await c.findOne({}, { sort: { seq: -1 } })
    const base = {
      seq: (last?.seq ?? 0) + 1,
      at: new Date(),
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      targetLabel: input.targetLabel ?? null,
      ip: input.ip ?? null,
    }
    const prevHash = last?.hash ?? GENESIS
    try {
      await c.insertOne({ ...base, prevHash, hash: hashOf(prevHash, base) })
      return
    } catch (e) {
      // A concurrent writer took this seq: retry with the next one.
      if ((e as { code?: number }).code !== 11000 || attempt >= 5) throw e
    }
  }
}

export async function listAudit(page: number, pageSize: number): Promise<{ entries: AuditEntry[]; total: number }> {
  const c = await col()
  const [entries, total] = await Promise.all([
    c.find({}, { projection: { _id: 0 } }).sort({ seq: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    c.countDocuments(),
  ])
  return { entries, total }
}

// Walks the whole chain; brokenAt is the first seq whose hash, link or sequence number does not match.
export async function verifyAuditChain(): Promise<{ ok: boolean; count: number; brokenAt?: number }> {
  let prev = GENESIS
  let expected = 1
  let count = 0
  for await (const e of (await col()).find({}, { projection: { _id: 0 } }).sort({ seq: 1 })) {
    const { prevHash, hash, ...rest } = e
    if (e.seq !== expected || prevHash !== prev || hash !== hashOf(prev, rest)) return { ok: false, count, brokenAt: e.seq }
    prev = hash
    expected++
    count++
  }
  return { ok: true, count }
}
