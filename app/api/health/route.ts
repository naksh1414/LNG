import { getDb } from '@/lib/db/mongo'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  try {
    await (await getDb()).command({ ping: 1 })
    return Response.json({ status: 'ok' })
  } catch {
    return Response.json({ status: 'db unavailable' }, { status: 503 })
  }
}
