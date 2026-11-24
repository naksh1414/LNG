import { getDb } from '@/lib/db/mongo'
import type { EventType } from './schema'
import type { Device } from './visitor'

type EventDoc = {
  type: EventType
  path?: string
  bookId?: string
  bookTitle?: string
  term?: string
  visitorHash: string
  device: Device
  createdAt: Date
}

export async function recordEvent(e: Omit<EventDoc, 'createdAt'>): Promise<void> {
  await (await getDb()).collection<EventDoc>('events').insertOne({ ...e, createdAt: new Date() })
}
