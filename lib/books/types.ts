import { z } from 'zod'

export type Book = {
  id: string
  title: string
  subtitle: string
  author: string
  slug: string
  series: string
  subject: string
  classLevel: string
  ageMin: number
  ageMax: number
  description: string
  coverUrl: string | null
  coverAlt: string
  isbn?: string
  pages?: number
  language?: string
  featured: boolean
  published: boolean
  createdAt: string
  updatedAt: string
}

export type BookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }

// Messages are shown inline in the admin book form.
const text = (field: string) => z.string().trim().min(1, `Enter ${field}.`).max(120, 'Use 120 characters or fewer.')
const age = z.number('Enter an age.').int('Use a whole number.').min(0, 'Use 0 to 18.').max(18, 'Use 0 to 18.')

export const bookInputSchema = z
  .object({
    title: text('a title'),
    subtitle: z.string().max(240, 'Use 240 characters or fewer.'),
    author: text('an author'),
    slug: z.string().max(120, 'Use 120 characters or fewer.').optional(),
    series: text('a series'),
    subject: text('a subject'),
    classLevel: text('a class'),
    ageMin: age,
    ageMax: age,
    description: z.string().max(2000, 'Use 2000 characters or fewer.'),
    // An uploaded https URL, or a file shipped in public/ such as /Books/cover.jpg.
    coverUrl: z
      .union([z.url({ protocol: /^https$/ }), z.string().regex(/^\/[^/\\]/)], { error: 'Upload the cover again.' })
      .nullable(),
    coverAlt: z.string().max(240, 'Use 240 characters or fewer.'),
    isbn: z.string().max(32, 'Use 32 characters or fewer.').optional(),
    pages: z.number('Enter a number of pages.').int('Use a whole number.').positive('Use a positive number.').optional(),
    language: z.string().max(60, 'Use 60 characters or fewer.').optional(),
    featured: z.boolean(),
    published: z.boolean(),
  })
  .refine((b) => b.ageMin <= b.ageMax, { path: ['ageMax'], message: 'The oldest age must be at least the youngest age.' })
