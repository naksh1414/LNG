// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { countAdmins, createAdmin, findAdminByEmail, findAdminById, setPasswordHash } from './admins-repo'

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-admins-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  await (await getDb()).collection('admins').deleteMany({})
}, 120000)

describe('admins repository', () => {
  it('findAdminByEmail is case-insensitive', async () => {
    const a = await createAdmin(' Owner@Example.com ', 'h1')
    expect(a).toEqual({ id: expect.any(String), email: 'owner@example.com', passwordHash: 'h1' })
    expect(await findAdminByEmail('OWNER@example.COM')).toEqual(a)
    expect(await findAdminByEmail('other@example.com')).toBeNull()
    expect(await findAdminById(a.id)).toEqual(a)
    expect(await findAdminById('nope')).toBeNull()
  })

  it('createAdmin enforces unique email', async () => {
    await createAdmin('owner@example.com', 'h1')
    await expect(createAdmin('OWNER@example.com', 'h2')).rejects.toThrow()
    expect(await countAdmins()).toBe(1)
  })

  it('setPasswordHash replaces the hash', async () => {
    const a = await createAdmin('owner@example.com', 'h1')
    expect(await setPasswordHash(a.id, 'h2')).toBe(true)
    expect((await findAdminById(a.id))?.passwordHash).toBe('h2')
    expect(await setPasswordHash('nope', 'h3')).toBe(false)
  })
})
