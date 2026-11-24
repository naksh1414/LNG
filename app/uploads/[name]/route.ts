import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { UPLOAD_DIR } from '@/lib/uploads/dir'

const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

// Serves files saved by the admin upload route when self-hosting (the standalone server does not serve files added after build).
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }): Promise<Response> {
  const { name } = await params
  const type = TYPES[name.split('.').pop() ?? '']
  if (!type || !/^[\w-]+\.\w+$/.test(name)) return new Response('Not found', { status: 404 })
  try {
    const file = await readFile(path.join(UPLOAD_DIR(), name))
    return new Response(file, {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
