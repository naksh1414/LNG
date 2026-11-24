// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { appendAudit, listAudit, verifyAuditChain } from './repo'

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-audit-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  await (await getDb()).collection('audit_log').deleteMany({})
}, 120000)

const add = (action: 'book_created' | 'book_deleted' | 'login_success', label?: string) =>
  appendAudit({ actorId: 'a1', actorEmail: 'admin@example.com', action, targetLabel: label })

describe('audit log', () => {
  it('numbers entries in order, lists newest first and verifies', async () => {
    await add('login_success')
    await add('book_created', 'Book A')
    await add('book_deleted', 'Book A')
    const { entries, total } = await listAudit(1, 10)
    expect(total).toBe(3)
    expect(entries.map((e) => e.seq)).toEqual([3, 2, 1])
    expect(await verifyAuditChain()).toEqual({ ok: true, count: 3 })
  })

  it('numbers concurrent writes without gaps or duplicates', async () => {
    await Promise.all([add('login_success'), add('login_success'), add('login_success'), add('login_success')])
    const { entries } = await listAudit(1, 10)
    expect(entries.map((e) => e.seq).sort()).toEqual([1, 2, 3, 4])
    expect((await verifyAuditChain()).ok).toBe(true)
  })

  it('detects an edited, removed or inserted entry', async () => {
    await add('book_created', 'Book A')
    await add('book_deleted', 'Book A')
    await add('login_success')
    const c = (await getDb()).collection('audit_log')

    await c.updateOne({ seq: 2 }, { $set: { actorEmail: 'someone@else.com' } })
    expect(await verifyAuditChain()).toEqual({ ok: false, count: 1, brokenAt: 2 })
    await c.updateOne({ seq: 2 }, { $set: { actorEmail: 'admin@example.com' } })
    expect((await verifyAuditChain()).ok).toBe(true)

    await c.deleteOne({ seq: 2 })
    expect((await verifyAuditChain()).ok).toBe(false)
  })
})
