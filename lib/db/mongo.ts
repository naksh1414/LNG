import { MongoClient, type Db } from 'mongodb'

let clientPromise: Promise<MongoClient> | undefined
let indexesPromise: Promise<void> | undefined

async function connect(): Promise<Db> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')
  const name = process.env.MONGODB_DB
  if (!name) throw new Error('MONGODB_DB is not set')
  clientPromise ??= MongoClient.connect(uri).catch((e) => {
    clientPromise = undefined
    throw e
  })
  return (await clientPromise).db(name)
}

export async function ensureIndexes(): Promise<void> {
  const books = (await connect()).collection('books')
  await books.createIndex({ slug: 1 }, { unique: true })
  await books.createIndex({ published: 1 })
  await books.createIndex({ subject: 1 })
}

// Indexes are created lazily, once per process.
export async function getDb(): Promise<Db> {
  const db = await connect()
  indexesPromise ??= ensureIndexes().catch((e) => {
    indexesPromise = undefined
    throw e
  })
  await indexesPromise
  return db
}
