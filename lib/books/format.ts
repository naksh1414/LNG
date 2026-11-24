export function ageLabel(min: number, max: number): string {
  // 18 is the form's upper limit, so a book up to 18 reads as open-ended.
  if (max >= 18) return `Ages ${min}+`
  return min === max ? `Age ${min}` : `Ages ${min} to ${max}`
}

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'book'
}

export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = base
  for (let n = 2; await exists(slug); n++) slug = `${base}-${n}`
  return slug
}
