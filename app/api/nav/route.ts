import { groupBySeries } from '@/lib/books/hierarchy'
import { listPublishedBooks, listSubjects } from '@/lib/books/repo'

export const dynamic = 'force-dynamic'

// Feeds the header's Series and Subjects menus; the header still works if this fails.
export async function GET(): Promise<Response> {
  try {
    const [books, subjects] = await Promise.all([listPublishedBooks(), listSubjects()])
    const series = groupBySeries(books).map(({ name, slug }) => ({ name, slug }))
    return Response.json({ series, subjects }, { headers: { 'Cache-Control': 'public, max-age=60' } })
  } catch {
    return Response.json({ series: [], subjects: [] })
  }
}
