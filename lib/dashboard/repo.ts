import { getDb } from '@/lib/db/mongo'
import type { Enquiry } from '@/lib/enquiries/repo'

export type Dashboard = {
  seriesBooks: { label: string; n: number; published: number }[]
  enquiriesDaily: { day: string; n: number }[]
  recentEnquiries: Enquiry[]
  unreadEnquiries: number
  testimonials: { total: number; published: number }
}

const DAYS = 30

// Counts for the dashboard that getMetrics does not cover. The caller decides which parts a role may see.
export async function getDashboard(): Promise<Dashboard> {
  const db = await getDb()
  const since = new Date(Date.now() - DAYS * 86_400_000)
  const [books, daily, recent, unread, testimonialsTotal, testimonialsPublished] = await Promise.all([
    db
      .collection('books')
      .aggregate<{ _id: string | null; n: number; published: number }>([
        { $group: { _id: '$series', n: { $sum: 1 }, published: { $sum: { $cond: ['$published', 1, 0] } } } },
        { $sort: { n: -1 } },
      ])
      .toArray(),
    db
      .collection('enquiries')
      .aggregate<{ _id: string; n: number }>([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } },
      ])
      .toArray(),
    db.collection('enquiries').find({}).sort({ createdAt: -1, _id: -1 }).limit(5).toArray(),
    db.collection('enquiries').countDocuments({ read: false }),
    db.collection('testimonials').countDocuments({}),
    db.collection('testimonials').countDocuments({ published: true }),
  ])
  const perDay = new Map(daily.map((d) => [d._id, d.n]))
  return {
    seriesBooks: books.map((b) => ({ label: b._id || 'More books', n: b.n, published: b.published })),
    // Every day in range, so quiet days show as zero.
    enquiriesDaily: Array.from({ length: DAYS }, (_, i) => {
      const day = new Date(Date.now() - (DAYS - 1 - i) * 86_400_000).toISOString().slice(0, 10)
      return { day, n: perDay.get(day) ?? 0 }
    }),
    recentEnquiries: recent.map(({ _id, createdAt, ...rest }) => ({ ...(rest as Omit<Enquiry, 'id' | 'createdAt'>), id: String(_id), createdAt: new Date(createdAt).toISOString() })),
    unreadEnquiries: unread,
    testimonials: { total: testimonialsTotal, published: testimonialsPublished },
  }
}
