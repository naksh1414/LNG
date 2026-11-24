import { getDb } from '@/lib/db/mongo'

export type Metrics = {
  days: number
  pageViews: number
  bookViews: number
  searches: number
  enquiriesSent: number
  visitors: number
  daily: { day: string; views: number }[]
  topBooks: { label: string; n: number }[]
  topSearches: { label: string; n: number }[]
  devices: { label: string; n: number }[]
  books: { total: number; published: number }
  enquiriesTotal: number
}

export async function getMetrics(days = 30): Promise<Metrics> {
  const db = await getDb()
  const events = db.collection('events')
  const since = new Date(Date.now() - days * 86_400_000)
  const inRange = { createdAt: { $gte: since } }
  const group = (match: object, key: string) =>
    events
      .aggregate<{ _id: string; n: number }>([
        { $match: { ...inRange, ...match } },
        { $group: { _id: key, n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 5 },
      ])
      .toArray()
      .then((rows) => rows.filter((r) => r._id).map((r) => ({ label: r._id, n: r.n })))

  const [byType, visitors, daily, topBooks, topSearches, devices, bookTotal, bookPublished, enquiriesTotal] = await Promise.all([
    events.aggregate<{ _id: string; n: number }>([{ $match: inRange }, { $group: { _id: '$type', n: { $sum: 1 } } }]).toArray(),
    events.distinct('visitorHash', inRange).then((v) => v.length),
    events
      .aggregate<{ _id: string; n: number }>([
        { $match: { ...inRange, type: 'page_view' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } },
      ])
      .toArray(),
    group({ type: 'book_view' }, '$bookTitle'),
    group({ type: 'search' }, '$term'),
    group({}, '$device'),
    db.collection('books').countDocuments({}),
    db.collection('books').countDocuments({ published: true }),
    db.collection('enquiries').countDocuments({}),
  ])

  const count = (t: string) => byType.find((r) => r._id === t)?.n ?? 0
  const perDay = new Map(daily.map((d) => [d._id, d.n]))
  // Every day in range, so quiet days show as empty bars.
  const series = Array.from({ length: days }, (_, i) => {
    const day = new Date(Date.now() - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10)
    return { day, views: perDay.get(day) ?? 0 }
  })

  return {
    days,
    pageViews: count('page_view'),
    bookViews: count('book_view'),
    searches: count('search'),
    enquiriesSent: count('enquiry_sent'),
    visitors,
    daily: series,
    topBooks,
    topSearches,
    devices,
    books: { total: bookTotal, published: bookPublished },
    enquiriesTotal,
  }
}
