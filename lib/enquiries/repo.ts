import { ObjectId, type WithId } from 'mongodb'
import { getDb } from '@/lib/db/mongo'

export type Enquiry = {
  id: string
  name: string
  contact: string
  message: string
  bookId?: string
  bookTitle?: string
  read: boolean
  createdAt: string
}

type EnquiryDoc = Omit<Enquiry, 'id' | 'createdAt'> & { createdAt: Date }

async function enquiries() {
  return (await getDb()).collection<EnquiryDoc>('enquiries')
}

function toEnquiry({ _id, createdAt, ...rest }: WithId<EnquiryDoc>): Enquiry {
  return { ...rest, id: _id.toHexString(), createdAt: createdAt.toISOString() }
}

const oid = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null)

export async function createEnquiry(input: {
  name: string
  contact: string
  message: string
  bookId?: string
  bookTitle?: string
}): Promise<Enquiry> {
  const doc: EnquiryDoc = { ...input, read: false, createdAt: new Date() }
  const { insertedId } = await (await enquiries()).insertOne(doc)
  return toEnquiry({ ...doc, _id: insertedId })
}

export async function listEnquiries(): Promise<Enquiry[]> {
  return (await (await enquiries()).find({}).sort({ createdAt: -1, _id: -1 }).toArray()).map(toEnquiry)
}

export async function setEnquiryRead(id: string, read: boolean): Promise<boolean> {
  const _id = oid(id)
  if (!_id) return false
  return (await (await enquiries()).updateOne({ _id }, { $set: { read } })).matchedCount === 1
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const _id = oid(id)
  if (!_id) return false
  return (await (await enquiries()).deleteOne({ _id })).deletedCount === 1
}

export async function countUnread(): Promise<number> {
  return (await enquiries()).countDocuments({ read: false })
}
