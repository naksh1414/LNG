// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { hit } from './rate-limit'

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-rl-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

describe('rate limit', () => {
  it('hit allows up to the limit then blocks and reports remaining', async () => {
    const now = () => 1_000_000
    expect(await hit('a', 2, 60_000, now)).toEqual({ allowed: true, remaining: 1 })
    expect(await hit('a', 2, 60_000, now)).toEqual({ allowed: true, remaining: 0 })
    expect(await hit('a', 2, 60_000, now)).toEqual({ allowed: false, remaining: 0 })
    expect(await hit('b', 2, 60_000, now)).toEqual({ allowed: true, remaining: 1 })
  })

  it('hit resets after the window', async () => {
    let t = 5_000_000
    const now = () => t
    await hit('c', 1, 60_000, now)
    expect((await hit('c', 1, 60_000, now)).allowed).toBe(false)
    t += 60_000
    expect((await hit('c', 1, 60_000, now)).allowed).toBe(true)
  })

  it('hit counts concurrent requests exactly', async () => {
    const now = () => 9_000_000
    const results = await Promise.all(Array.from({ length: 10 }, () => hit('d', 3, 60_000, now)))
    expect(results.filter((r) => r.allowed)).toHaveLength(3)
  })
})
