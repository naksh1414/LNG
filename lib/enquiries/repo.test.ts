// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { countUnread, createEnquiry, deleteEnquiry, listEnquiries, setEnquiryRead } from './repo'

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-enq-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  await (await getDb()).collection('enquiries').deleteMany({})
}, 120000)

const base = { name: 'Asha', contact: 'a@b.in', message: 'Hello' }

describe('enquiry repository', () => {
  it('createEnquiry stores a book title snapshot', async () => {
    const e = await createEnquiry({ ...base, bookId: '64b7f0c2a1b2c3d4e5f60718', bookTitle: 'Owl' })
    expect(e).toMatchObject({ ...base, bookTitle: 'Owl', read: false })
    expect(typeof e.id).toBe('string')
    expect((await listEnquiries())[0]).toEqual(e)
  })

  it('listEnquiries returns newest first', async () => {
    await createEnquiry({ ...base, name: 'first' })
    await createEnquiry({ ...base, name: 'second' })
    expect((await listEnquiries()).map((e) => e.name)).toEqual(['second', 'first'])
  })

  it('setEnquiryRead toggles', async () => {
    const e = await createEnquiry(base)
    expect(await setEnquiryRead(e.id, true)).toBe(true)
    expect((await listEnquiries())[0].read).toBe(true)
    expect(await setEnquiryRead(e.id, false)).toBe(true)
    expect((await listEnquiries())[0].read).toBe(false)
    expect(await setEnquiryRead('nope', true)).toBe(false)
  })

  it('countUnread counts only unread', async () => {
    const a = await createEnquiry(base)
    await createEnquiry(base)
    await setEnquiryRead(a.id, true)
    expect(await countUnread()).toBe(1)
  })

  it('deleteEnquiry removes the enquiry', async () => {
    const e = await createEnquiry(base)
    expect(await deleteEnquiry(e.id)).toBe(true)
    expect(await deleteEnquiry(e.id)).toBe(false)
    expect(await deleteEnquiry('nope')).toBe(false)
  })
})
