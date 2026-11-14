import { randomUUID } from 'node:crypto'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/auth/require-admin'
import { isCrossOrigin } from '@/lib/request'
import { CONTENT_TYPE, MAX_COVER_BYTES, validateCover } from '@/lib/uploads/validate'

// shortcut: Vercel caps function request bodies at 4.5 MB, so covers above that fail on Vercel before this runs;
// switch to client uploads (@vercel/blob/client handleUpload) if larger covers are needed.
export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return Response.json({ error: 'Cross-origin request refused.' }, { status: 403 })

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error('admin upload: BLOB_READ_WRITE_TOKEN is not set')
    return Response.json(
      { error: 'Cover uploads are not set up: BLOB_READ_WRITE_TOKEN is missing on the server.' },
      { status: 503 },
    )
  }

  // Refuse an oversized body before buffering it (multipart overhead allowed).
  if (Number(request.headers.get('content-length')) > MAX_COVER_BYTES + 64 * 1024) {
    return Response.json({ error: 'The image must be 5 MB or smaller.' }, { status: 413 })
  }

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return Response.json({ error: 'Invalid upload.' }, { status: 400 })
  }
  if (!(file instanceof File)) return Response.json({ error: 'Choose an image to upload.' }, { status: 400 })

  const bytes = new Uint8Array(await file.arrayBuffer())
  const result = validateCover({ type: file.type, size: file.size, name: file.name, bytes })
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 })

  try {
    // Server-chosen name: the client filename never reaches the storage path.
    const blob = await put(`covers/${randomUUID()}.${result.ext}`, Buffer.from(bytes), {
      access: 'public',
      contentType: CONTENT_TYPE[result.ext],
      addRandomSuffix: false,
      token,
    })
    return Response.json({ url: blob.url })
  } catch (err) {
    console.error('admin upload: blob put failed:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ error: 'Could not store the image. Try again shortly.' }, { status: 502 })
  }
}
