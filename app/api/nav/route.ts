import { groupBySeries } from '@/lib/books/hierarchy'
import { listPublishedBooks } from '@/lib/books/repo'

export const dynamic = 'force-dynamic'

// Feeds the header's Series menu: each series with its own subjects. The header still works if this fails.
export async function GET(): Promise<Response> {
  try {
    const series = groupBySeries(await listPublishedBooks()).map(({ name, slug, subjects }) => ({
      name,
      slug,
      subjects: subjects.map((s) => ({ name: s.name, slug: s.slug })),
    }))
    return Response.json({ series }, { headers: { 'Cache-Control': 'public, max-age=60' } })
  } catch {
    return Response.json({ series: [] })
  }
}
