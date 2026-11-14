import bcrypt from 'bcryptjs'

// A real cost-12 hash of a random string; compared against when the email is unknown so
// the response takes as long as a wrong password and does not reveal which emails exist.
export const DUMMY_HASH = '$2b$12$WN4Qzai4k1S4xVMMkADzfOeLyvELrZW5Q4gG4sO3DNUhklD0OOBwq'

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

// bcrypt.compare is constant time; a malformed hash counts as a mismatch.
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

export function passwordPolicy(plain: string): string | null {
  if (plain.length < 10) return 'Use at least 10 characters.'
  // bcrypt ignores everything after 72 bytes.
  if (new TextEncoder().encode(plain).length > 72) return 'Use at most 72 bytes (about 72 letters).'
  return null
}
