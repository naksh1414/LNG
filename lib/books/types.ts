import { z } from 'zod'

export type Book = {
  id: string
  title: string
  subtitle: string
  author: string
  slug: string
  subject: string
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

const text = z.string().trim().min(1).max(120)
const age = z.number().int().min(0).max(18)

export const bookInputSchema = z
  .object({
    title: text,
    subtitle: z.string().max(240),
    author: text,
    slug: z.string().optional(),
    subject: text,
    ageMin: age,
    ageMax: age,
    description: z.string().max(2000),
    coverUrl: z.url({ protocol: /^https$/ }).nullable(),
    coverAlt: z.string(),
    isbn: z.string().optional(),
    pages: z.number().int().positive().optional(),
    language: z.string().optional(),
    featured: z.boolean(),
    published: z.boolean(),
  })
  .refine((b) => b.ageMin <= b.ageMax, { path: ['ageMax'], message: 'ageMax must be at least ageMin' })
