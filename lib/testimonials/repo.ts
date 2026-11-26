import { ObjectId, type WithId } from 'mongodb'
import { getDb } from '@/lib/db/mongo'

export type Testimonial = { id: string; quote: string; name: string; role: string; published: boolean; createdAt: string }
export type TestimonialInput = Pick<Testimonial, 'quote' | 'name' | 'role' | 'published'>

type Doc = Omit<Testimonial, 'id' | 'createdAt'> & { createdAt: Date }

const col = async () => (await getDb()).collection<Doc>('testimonials')
const oid = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null)
const toItem = ({ _id, createdAt, ...rest }: WithId<Doc>): Testimonial => ({ ...rest, id: _id.toHexString(), createdAt: createdAt.toISOString() })

export async function listTestimonials(onlyPublished = false): Promise<Testimonial[]> {
  return (await (await col()).find(onlyPublished ? { published: true } : {}).sort({ createdAt: -1, _id: -1 }).toArray()).map(toItem)
}

export async function createTestimonial(input: TestimonialInput): Promise<Testimonial> {
  const doc: Doc = { ...input, createdAt: new Date() }
  const { insertedId } = await (await col()).insertOne(doc)
  return toItem({ ...doc, _id: insertedId })
}

export async function updateTestimonial(id: string, input: Partial<TestimonialInput>): Promise<Testimonial | null> {
  const _id = oid(id)
  if (!_id) return null
  const doc = await (await col()).findOneAndUpdate({ _id }, { $set: input }, { returnDocument: 'after' })
  return doc ? toItem(doc) : null
}

export async function deleteTestimonial(id: string): Promise<Testimonial | null> {
  const _id = oid(id)
  if (!_id) return null
  const doc = await (await col()).findOneAndDelete({ _id })
  return doc ? toItem(doc) : null
}
