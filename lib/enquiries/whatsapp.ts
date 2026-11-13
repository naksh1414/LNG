export function normalizeNumber(raw: string | undefined): string | null {
  const digits = (raw ?? '').replace(/[\s+\-().]/g, '')
  return /^\d{8,15}$/.test(digits) ? digits : null
}

export function buildWhatsAppUrl(
  number: string | undefined,
  e: { name: string; contact: string; message: string; bookTitle?: string },
): string | null {
  const digits = normalizeNumber(number)
  if (!digits) return null
  const lines = [`Hello Learn and Grow, I am ${e.name} (${e.contact}).`]
  if (e.bookTitle) lines.push(`I am asking about "${e.bookTitle}".`)
  const text = `${lines.join('\n')}\n\n${e.message}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
