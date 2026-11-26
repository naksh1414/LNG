// The catalogue's state lives in the URL (?subject=&q=&page=), so every page is a link and nothing is held in the browser.
export const PAGE_SIZE = 8
const MAX_QUERY = 80

export type CatalogQuery = { series?: string; subject?: string; q: string; page: number }

type Params = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

// A subject belongs to a series. series is the slug. Unknown values, junk page numbers and oversized
// searches are dropped, never trusted. A subject with no series (an old ?subject= link) is kept if any series has it.
export function parseCatalogQuery(params: Params, series: { slug: string; subjects: string[] }[]): CatalogQuery {
  const slug = one(params.series)
  const chosen = series.find((s) => s.slug === slug)
  const subject = one(params.subject)
  const known = chosen ? chosen.subjects : series.flatMap((s) => s.subjects)
  const page = Number.parseInt(one(params.page) ?? '1', 10)
  return {
    series: chosen?.slug,
    subject: subject && known.includes(subject) ? subject : undefined,
    q: (one(params.q) ?? '').trim().slice(0, MAX_QUERY),
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, 10_000) : 1,
  }
}

export function catalogHref({ series, subject, q, page }: Partial<CatalogQuery>): string {
  const sp = new URLSearchParams()
  if (series) sp.set('series', series)
  if (subject) sp.set('subject', subject)
  if (q) sp.set('q', q)
  if (page && page > 1) sp.set('page', String(page))
  const qs = sp.toString()
  return qs ? `/catalog?${qs}` : '/catalog'
}

// 1 ... 4 5 [6] 7 8 ... 20: first, last, and two either side of the current page.
export function pageList(page: number, totalPages: number): (number | 'gap')[] {
  const keep = new Set([1, totalPages, ...Array.from({ length: 5 }, (_, i) => page - 2 + i)].filter((n) => n >= 1 && n <= totalPages))
  const sorted = [...keep].sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? (['gap', n] as const) : [n]))
}
