export const MAX_COVER_BYTES = 5 * 1024 * 1024

type Ext = 'jpg' | 'png' | 'webp'

export const COVER_TYPES: Record<string, Ext> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const CONTENT_TYPE: Record<Ext, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

const startsWith = (bytes: Uint8Array, sig: number[], at = 0) => sig.every((b, i) => bytes[at + i] === b)
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0))

function sniff(bytes: Uint8Array): Ext | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpg'
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png'
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) return 'webp'
  return null
}

// The client filename is never trusted or used: the extension comes from the content alone.
export function validateCover(file: {
  type: string
  size: number
  name: string
  bytes: Uint8Array
}): { ok: true; ext: Ext } | { ok: false; error: string } {
  const declared = COVER_TYPES[file.type]
  if (!declared) return { ok: false, error: 'Use a JPEG, PNG or WebP image.' }
  if (file.size < 1 || file.bytes.length < 1) return { ok: false, error: 'The file is empty.' }
  if (file.size > MAX_COVER_BYTES || file.bytes.length > MAX_COVER_BYTES) {
    return { ok: false, error: 'The image must be 5 MB or smaller.' }
  }
  if (sniff(file.bytes) !== declared) return { ok: false, error: 'The file content does not match a JPEG, PNG or WebP image.' }
  return { ok: true, ext: declared }
}
