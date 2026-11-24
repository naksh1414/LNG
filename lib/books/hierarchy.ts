import { slugify } from './format'
import type { Book } from './types'

export const FALLBACK_SERIES = 'More books'
export const FALLBACK_CLASS = 'All classes'

export type SubjectGroup = { name: string; slug: string; books: Book[] }
export type SeriesGroup = {
  name: string
  slug: string
  subjects: SubjectGroup[]
  books: Book[]
  ageMin: number
  ageMax: number
}

// Pre-primary first, then Class 1 upwards; anything else sorts last by name.
export function classRank(level: string): number {
  const l = level.trim().toLowerCase()
  const pre = ['playgroup', 'pre-nursery', 'nursery', 'lkg', 'ukg'].indexOf(l)
  if (pre >= 0) return pre
  const n = /^(?:class\s+)?(\d+)$/.exec(l)
  return n ? 10 + Number(n[1]) : 1000
}

const byClass = (a: Book, b: Book) =>
  classRank(a.classLevel) - classRank(b.classLevel) || a.classLevel.localeCompare(b.classLevel) || a.title.localeCompare(b.title)

export const seriesName = (b: Book) => b.series.trim() || FALLBACK_SERIES

// Series, then subjects inside each series, then books ordered by class.
export function groupBySeries(books: Book[]): SeriesGroup[] {
  const map = new Map<string, Book[]>()
  for (const b of books) map.set(seriesName(b), [...(map.get(seriesName(b)) ?? []), b])
  return [...map].map(([name, list]) => {
    const subjects = new Map<string, Book[]>()
    for (const b of list) subjects.set(b.subject, [...(subjects.get(b.subject) ?? []), b])
    return {
      name,
      slug: slugify(name),
      books: list,
      subjects: [...subjects].map(([subject, items]) => ({ name: subject, slug: slugify(subject), books: [...items].sort(byClass) })),
      ageMin: Math.min(...list.map((b) => b.ageMin)),
      ageMax: Math.max(...list.map((b) => b.ageMax)),
    }
  })
}

// Books of one subject grouped by class, in class order.
export function groupByClass(books: Book[]): { level: string; books: Book[] }[] {
  const out: { level: string; books: Book[] }[] = []
  for (const b of [...books].sort(byClass)) {
    const level = b.classLevel.trim() || FALLBACK_CLASS
    const last = out[out.length - 1]
    if (last?.level === level) last.books.push(b)
    else out.push({ level, books: [b] })
  }
  return out
}

// Takes one book from each series in turn, so a short list (like "current favourites") shows every series
// instead of the oldest series filling every slot.
export function spreadAcrossSeries(books: Book[]): Book[] {
  const queues = groupBySeries(books).map((s) => [...s.books])
  const out: Book[] = []
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!)
  return out
}
