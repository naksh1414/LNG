// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { signInAs } from '@/tests/admin-session'
import { POST } from './route'

const put = vi.hoisted(() => vi.fn())
vi.mock('@vercel/blob', () => ({ put }))

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])
let cookie: string
let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-upload-test'
  process.env.SESSION_SECRET = 't'.repeat(40)
  cookie = (await signInAs()).cookie
}, 120000)
afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})
beforeEach(() => {
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob-token')
  put.mockReset()
  put.mockImplementation(async (path: string) => ({ url: `https://store.public.blob.vercel-storage.com/${path}` }))
})
afterEach(() => vi.unstubAllEnvs())

const upload = (bytes: Uint8Array, type: string, name: string, auth = true) => {
  const form = new FormData()
  form.append('file', new File([bytes], name, { type }))
  return POST(new Request('http://admin.test/api/admin/upload', { method: 'POST', headers: auth ? { cookie } : {}, body: form }))
}

describe('POST /api/admin/upload', () => {
  it('returns 401 without a session', async () => {
    expect((await upload(PNG, 'image/png', 'a.png', false)).status).toBe(401)
    expect(put).not.toHaveBeenCalled()
  })

  it('rejects a disallowed type with 400 and never calls Blob', async () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>')
    for (const [bytes, type] of [[svg, 'image/svg+xml'], [svg, 'image/png'], [PNG, 'image/gif']] as const) {
      const res = await upload(bytes, type, 'cover.png')
      expect(res.status).toBe(400)
      expect((await res.json()).error).toEqual(expect.any(String))
    }
    expect(put).not.toHaveBeenCalled()
  })

  it('stores an allowed image and returns its url', async () => {
    const res = await upload(PNG, 'image/png', '../../cover.php.png')
    expect(res.status).toBe(200)
    const [path, , options] = put.mock.calls[0]
    expect(path).toMatch(/^covers\/[0-9a-f-]{36}\.png$/)
    expect(options).toMatchObject({ access: 'public', contentType: 'image/png', token: 'blob-token' })
    expect(await res.json()).toEqual({ url: `https://store.public.blob.vercel-storage.com/${path}` })
  })

  it('returns 503 with a clear message when the Blob token is missing', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')
    const res = await upload(PNG, 'image/png', 'a.png')
    expect(res.status).toBe(503)
    expect((await res.json()).error).toMatch(/BLOB_READ_WRITE_TOKEN/)
    expect(put).not.toHaveBeenCalled()
  })

  it('rejects a cross-origin upload with 403', async () => {
    const form = new FormData()
    form.append('file', new File([PNG], 'a.png', { type: 'image/png' }))
    const res = await POST(
      new Request('http://admin.test/api/admin/upload', { method: 'POST', headers: { cookie, origin: 'https://evil.example' }, body: form }),
    )
    expect(res.status).toBe(403)
    expect(put).not.toHaveBeenCalled()
  })
})
