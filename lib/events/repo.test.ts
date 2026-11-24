// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { recordEvent } from './repo'

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-events-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

describe('event repository', () => {
  it('recordEvent stores the event and the TTL index exists', async () => {
    await recordEvent({ type: 'book_view', path: '/books/owl', bookId: 'b1', bookTitle: 'Owl', visitorHash: 'h', device: 'mobile' })
    const col = (await getDb()).collection('events')
    expect(await col.findOne({}, { projection: { _id: 0 } })).toMatchObject({
      type: 'book_view', path: '/books/owl', bookId: 'b1', bookTitle: 'Owl', visitorHash: 'h', device: 'mobile',
    })
    const ttl = (await col.indexes()).find((i) => i.key.createdAt && i.expireAfterSeconds !== undefined)
    expect(ttl?.expireAfterSeconds).toBe(13 * 30 * 24 * 60 * 60)
  })
})
