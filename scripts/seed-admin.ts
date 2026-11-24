// MONGODB_URI, MONGODB_DB, ADMIN_EMAIL and ADMIN_PASSWORD must be exported in the shell:
// tsx does not load .env.local. Usage: pnpm seed-admin, or pnpm seed-admin -- --reset.
import { countAdmins, createAdmin, findAdminByEmail, setPasswordHash } from '../lib/auth/admins-repo'
import { hashPassword, passwordPolicy } from '../lib/auth/password'
import { getDb } from '../lib/db/mongo'

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim()
  if (!email) throw new Error('ADMIN_EMAIL is not set')
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD is not set')
  const policyError = passwordPolicy(password)
  if (policyError) throw new Error(`ADMIN_PASSWORD is too weak: ${policyError}`)
  const reset = process.argv.includes('--reset')

  await getDb()
  if ((await countAdmins()) === 0) {
    await createAdmin(email, await hashPassword(password))
    console.log(`created admin ${email.toLowerCase()}`)
    return
  }
  if (!reset) {
    console.log('an admin already exists, nothing seeded (use pnpm seed-admin -- --reset to replace the password)')
    return
  }
  const admin = await findAdminByEmail(email)
  if (!admin) throw new Error(`no admin with email ${email} (ADMIN_EMAIL must match the existing admin)`)
  await setPasswordHash(admin.id, await hashPassword(password))
  console.log(`password replaced for ${admin.email}`)
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  },
)
