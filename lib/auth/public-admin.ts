import type { Admin } from './admins-repo'

// What the browser may see about an admin: never the password hash.
export type PublicAdmin = Omit<Admin, 'passwordHash'>
export const toPublic = ({ passwordHash: _hash, ...rest }: Admin): PublicAdmin => rest
