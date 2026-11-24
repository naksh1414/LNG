// MONGODB_URI and MONGODB_DB must be exported in the shell: tsx does not load .env.local.
import { getDb } from '../lib/db/mongo'
import { createBook } from '../lib/books/repo'
import { seedBooks } from '../lib/books/seed-data'

async function main() {
  const db = await getDb()
  if ((await db.collection('books').countDocuments({})) > 0) {
    console.log('books collection is not empty, nothing seeded')
    return
  }
  for (const input of seedBooks) await createBook(input)
  console.log(`seeded ${seedBooks.length} books`)
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e)
    process.exit(1)
  },
)
