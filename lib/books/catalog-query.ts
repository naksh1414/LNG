// The catalogue's state lives in the URL (?subject=&q=&page=), so every page is a link and nothing is held in the browser.
export const PAGE_SIZE = 8
const MAX_QUERY = 80

export type CatalogQuery = { subject?: string; q: string; page: number }

type Params = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

// Unknown subjects, junk page numbers and oversized searches are dropped, never trusted.
export function parseCatalogQuery(params: Params, subjects: string[]): CatalogQuery {
  const subject = one(params.subject)
  const page = Number.parseInt(one(params.page) ?? '1', 10)
  return {
    subject: subject && subjects.includes(subject) ? subject : undefined,
    q: (one(params.q) ?? '').trim().slice(0, MAX_QUERY),
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, 10_000) : 1,
  }
}

export function catalogHref({ subject, q, page }: Partial<CatalogQuery>): string {
  const sp = new URLSearchParams()
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
