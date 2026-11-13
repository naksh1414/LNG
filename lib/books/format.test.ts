import { describe, expect, it } from 'vitest'
import { ageLabel, slugify, uniqueSlug } from './format'
import { seedBooks } from './seed-data'
import { bookInputSchema } from './types'

describe('ageLabel', () => {
  it('formats a range', () => expect(ageLabel(3, 6)).toBe('Ages 3 to 6'))
  it('formats a single age', () => expect(ageLabel(4, 4)).toBe('Age 4'))
})

describe('slugify', () => {
  it('lowercases, strips apostrophes and punctuation, collapses spaces', () => {
    expect(slugify("A Room of One's Own")).toBe('a-room-of-ones-own')
    expect(slugify('  Hello,   World!! ')).toBe('hello-world')
  })
  it("transliterates nothing and never returns empty (falls back to 'book')", () => {
    expect(slugify('!!!')).toBe('book')
    expect(slugify('')).toBe('book')
    expect(slugify('日本語')).toBe('book')
  })
})

describe('uniqueSlug', () => {
  it('appends -2 then -3', async () => {
    const taken = new Set(['a', 'a-2'])
    expect(await uniqueSlug('a', async (s) => taken.has(s))).toBe('a-3')
    expect(await uniqueSlug('b', async (s) => taken.has(s))).toBe('b')
    expect(await uniqueSlug('a', async (s) => s === 'a')).toBe('a-2')
  })
})

const valid = { ...seedBooks[0] }

describe('bookInputSchema', () => {
  it('accepts a valid book', () => expect(bookInputSchema.safeParse(valid).success).toBe(true))
  it('rejects ageMin greater than ageMax', () => {
    expect(bookInputSchema.safeParse({ ...valid, ageMin: 7, ageMax: 6 }).success).toBe(false)
  })
  it('rejects a non-https coverUrl', () => {
    expect(bookInputSchema.safeParse({ ...valid, coverUrl: 'http://x.com/a.png' }).success).toBe(false)
    expect(bookInputSchema.safeParse({ ...valid, coverUrl: 'https://x.com/a.png' }).success).toBe(true)
  })
  it('rejects bad field values', () => {
    expect(bookInputSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
    expect(bookInputSchema.safeParse({ ...valid, ageMax: 19 }).success).toBe(false)
    expect(bookInputSchema.safeParse({ ...valid, pages: 0 }).success).toBe(false)
    expect(bookInputSchema.safeParse({ ...valid, description: 'x'.repeat(2001) }).success).toBe(false)
  })
})

describe('seedBooks', () => {
  it('has 8 entries that all pass bookInputSchema', () => {
    expect(seedBooks).toHaveLength(8)
    for (const b of seedBooks) expect(bookInputSchema.safeParse(b).success).toBe(true)
  })
})
