import { z } from 'zod'

// Only grantable areas, each limited to the levels that mean something there. strict() rejects anything else,
// notably users, so a custom role can never manage users or roles.
const rw = z.enum(['none', 'read', 'write']).default('none')
const ro = z.enum(['none', 'read']).default('none')

export const permissionsSchema = z.strictObject({ catalog: rw, testimonials: rw, enquiries: rw, metrics: ro, audit: ro })
export const nameSchema = z.string().trim().min(1, 'Enter a role name.').max(40, 'Use 40 characters or fewer.')
