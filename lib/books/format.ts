export function ageLabel(min: number, max: number): string {
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
