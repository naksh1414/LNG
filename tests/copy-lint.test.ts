import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(__dirname, '..')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|css|mjs)$/.test(name) ? [p] : []
  })
}

const files = [...walk(join(root, 'app')), ...walk(join(root, 'components')), ...walk(join(root, 'lib'))].map(
  (p) => ({ path: relative(root, p), text: readFileSync(p, 'utf8') }),
)
const sources = files.filter((f) => !/\.test\.tsx?$/.test(f.path))

const offenders = (test: (text: string) => boolean, list = files) => list.filter((f) => test(f.text)).map((f) => f.path)

describe('copy lint', () => {
  it('scans lib/site.ts among the sources', () => {
    expect(files.map((f) => f.path)).toContain(join('lib', 'site.ts'))
  })

  it('no em-dash or en-dash character in app, components or lib source', () => {
    expect(offenders((t) => /[–—]/.test(t))).toEqual([])
  })

  it("no use of window.addEventListener('scroll'", () => {
    expect(offenders((t) => /addEventListener\(\s*['"`]scroll/.test(t))).toEqual([])
  })

  it('no import from lucide-react alongside another icon family', () => {
    const families = [
      'lucide-react',
      'react-icons',
      '@heroicons/react',
      '@phosphor-icons/react',
      '@radix-ui/react-icons',
      '@tabler/icons-react',
      '@fortawesome/react-fontawesome',
    ]
    const used = families.filter((f) => files.some((file) => new RegExp(`from ['"]${f}(/[^'"]*)?['"]`).test(file.text)))
    expect(used.length).toBeLessThanOrEqual(1)
  })

  it('every motion component references useReducedMotion or MotionConfig reducedMotion', () => {
    const motionFiles = sources.filter((f) => /from ['"](motion\/react|framer-motion)['"]/.test(f.text))
    expect(motionFiles.length).toBeGreaterThan(0)
    const missing = motionFiles
      .filter((f) => !/useReducedMotion\(/.test(f.text) && !/MotionConfig[^>]*reducedMotion=/.test(f.text))
      .map((f) => f.path)
    expect(missing).toEqual([])
  })

  it('no h-screen class anywhere in source', () => {
    expect(offenders((t) => /\bh-screen\b/.test(t), sources)).toEqual([])
  })

  it('only the first cover on a page is loaded eagerly', () => {
    // Allowed: the single cover on a book page.
    const allowed = ['app/books/[slug]/page.tsx', 'components/book-cover.tsx']
    const eager = offenders((t) => /\b(priority|preload)\b|loading=["']eager|fetchPriority/.test(t), sources).filter(
      (p) => !allowed.includes(p),
    )
    expect(eager).toEqual([])
  })
})
