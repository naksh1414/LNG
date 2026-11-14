import { describe, expect, it } from 'vitest'
import { MAX_COVER_BYTES, validateCover } from './validate'

const JPEG = [0xff, 0xd8, 0xff, 0xe0]
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const WEBP = [...'RIFF'].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [...'WEBP'].map((c) => c.charCodeAt(0)))

const file = (type: string, head: number[], size = 1024, name = 'cover') => {
  const bytes = new Uint8Array(Math.max(size, head.length))
  bytes.set(head)
  return { type, size, name, bytes }
}

describe('validateCover', () => {
  it('validateCover accepts real JPEG, PNG and WebP bytes', () => {
    expect(validateCover(file('image/jpeg', JPEG))).toEqual({ ok: true, ext: 'jpg' })
    expect(validateCover(file('image/png', PNG))).toEqual({ ok: true, ext: 'png' })
    expect(validateCover(file('image/webp', WEBP))).toEqual({ ok: true, ext: 'webp' })
  })

  it('validateCover rejects an SVG with an image/png label', () => {
    const svg = [...'<svg xmlns="http://www.w3.org/2000/svg"></svg>'].map((c) => c.charCodeAt(0))
    expect(validateCover(file('image/png', svg, svg.length, 'cover.png')).ok).toBe(false)
    expect(validateCover(file('image/svg+xml', svg, svg.length, 'cover.svg')).ok).toBe(false)
  })

  it('validateCover rejects 5 MB plus one byte, zero bytes, and a PNG labelled image/jpeg', () => {
    expect(validateCover(file('image/png', PNG, MAX_COVER_BYTES + 1)).ok).toBe(false)
    expect(validateCover(file('image/png', PNG, MAX_COVER_BYTES)).ok).toBe(true)
    expect(validateCover({ type: 'image/png', size: 0, name: 'a.png', bytes: new Uint8Array() }).ok).toBe(false)
    expect(validateCover(file('image/jpeg', PNG)).ok).toBe(false)
  })

  it('validateCover ignores a double-extension name like cover.php.png and returns only the detected ext', () => {
    expect(validateCover(file('image/png', PNG, 1024, 'cover.php.png'))).toEqual({ ok: true, ext: 'png' })
    expect(validateCover(file('image/png', PNG, 1024, '../../evil.php'))).toEqual({ ok: true, ext: 'png' })
  })

  it('rejects a RIFF file that is not WebP', () => {
    const wav = [...'RIFF'].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [...'WAVE'].map((c) => c.charCodeAt(0)))
    expect(validateCover(file('image/webp', wav)).ok).toBe(false)
  })
})
