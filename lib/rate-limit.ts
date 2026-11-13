import { getDb } from '@/lib/db/mongo'

// Fixed-window counter. One document per (key, windowStart) bucket, bumped with a single
// atomic findOneAndUpdate ($inc + upsert), so concurrent requests are counted exactly.
// The unique index on { key, windowStart } turns a racing first upsert into a duplicate-key
// error, which we retry once. Buckets expire through the TTL index on expiresAt.
export async function hit(
  key: string,
  limit: number,
  windowMs: number,
  now: () => number = Date.now,
): Promise<{ allowed: boolean; remaining: number }> {
  const col = (await getDb()).collection<{ key: string; windowStart: number; count: number; expiresAt: Date }>(
    'rate_limits',
  )
  const t = now()
  const windowStart = Math.floor(t / windowMs) * windowMs
  const run = () =>
    col.findOneAndUpdate(
      { key, windowStart },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + windowMs) } },
      { upsert: true, returnDocument: 'after' },
    )
  let doc
  try {
    doc = await run()
  } catch (e) {
    if ((e as { code?: number }).code !== 11000) throw e
    doc = await run()
  }
  const count = doc?.count ?? 1
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
}
