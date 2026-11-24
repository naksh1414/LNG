import { z } from 'zod'

const path = z.string().max(300).startsWith('/').refine((p) => p !== '/admin' && !p.startsWith('/admin/'), 'admin paths are not tracked')

// bookId is optional on book_view: the client only knows the slug, so the route resolves it from the path.
export const eventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('page_view'), path }),
  z.object({ type: z.literal('book_view'), path, bookId: z.string().max(40).optional() }),
  z.object({ type: z.literal('search'), term: z.string().trim().min(1).max(80) }),
  z.object({ type: z.literal('enquiry_sent'), bookId: z.string().max(40).optional() }),
])

export type EventInput = z.infer<typeof eventSchema>
export type EventType = EventInput['type']
