import { MongoClient, type Db } from 'mongodb'

// On globalThis so Next dev hot reload reuses one client instead of leaking connections.
const g = globalThis as typeof globalThis & { _lngMongo?: Promise<MongoClient>; _lngIndexes?: Promise<void> }

async function connect(): Promise<Db> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')
  const name = process.env.MONGODB_DB
  if (!name) throw new Error('MONGODB_DB is not set')
  // maxPoolSize: each serverless instance keeps few connections, so many instances do not exhaust Atlas.
  g._lngMongo ??= MongoClient.connect(uri, { maxPoolSize: 10 }).catch((e) => {
    g._lngMongo = undefined
    throw e
  })
  return (await g._lngMongo).db(name)
}

export async function ensureIndexes(): Promise<void> {
  const books = (await connect()).collection('books')
  await books.createIndex({ slug: 1 }, { unique: true })
  await books.createIndex({ published: 1 })
  await books.createIndex({ subject: 1 })
  const db = await connect()
  await db.collection('rate_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  await db.collection('rate_limits').createIndex({ key: 1, windowStart: 1 }, { unique: true })
  // 13 months at 30 days each.
  await db.collection('events').createIndex({ createdAt: 1 }, { expireAfterSeconds: 13 * 30 * 24 * 60 * 60 })
  await db.collection('enquiries').createIndex({ createdAt: -1, read: 1 })
  await db.collection('admins').createIndex({ email: 1 }, { unique: true })
  await db.collection('roles').createIndex({ nameKey: 1 }, { unique: true })
}

// Indexes are created lazily, once per process.
export async function getDb(): Promise<Db> {
  const db = await connect()
  g._lngIndexes ??= ensureIndexes().catch((e) => {
    g._lngIndexes = undefined
    throw e
  })
  await g._lngIndexes
  return db
}
