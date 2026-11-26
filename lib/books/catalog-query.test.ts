import { describe, expect, it } from 'vitest'
import { catalogHref, pageList, parseCatalogQuery } from './catalog-query'

describe('catalog query', () => {
  const series = [
    { slug: 'dreamscape', subjects: ['Nature', 'Language'] },
    { slug: 'kids-magic', subjects: ['English'] },
  ]

  it('keeps a known series, a subject of that series, a trimmed search and a valid page; drops the rest', () => {
    expect(parseCatalogQuery({ series: 'dreamscape', subject: 'Nature', q: '  owl ', page: '3' }, series)).toEqual({ series: 'dreamscape', subject: 'Nature', q: 'owl', page: 3 })
    // a subject that belongs to another series is dropped
    expect(parseCatalogQuery({ series: 'kids-magic', subject: 'Nature' }, series)).toEqual({ series: 'kids-magic', subject: undefined, q: '', page: 1 })
    expect(parseCatalogQuery({ series: 'nope' }, series).series).toBeUndefined()
    // an old subject-only link is kept if any series has the subject
    expect(parseCatalogQuery({ subject: 'English' }, series).subject).toBe('English')
    expect(parseCatalogQuery({ subject: 'Nope' }, series).subject).toBeUndefined()
    expect(parseCatalogQuery({ page: '-4' }, series).page).toBe(1)
    expect(parseCatalogQuery({ page: 'abc' }, series).page).toBe(1)
    expect(parseCatalogQuery({ series: ['a', 'b'], q: ['x'] }, series).q).toBe('')
    expect(parseCatalogQuery({ q: 'x'.repeat(500) }, series).q).toHaveLength(80)
  })

  it('catalogHref leaves out defaults and encodes values', () => {
    expect(catalogHref({})).toBe('/catalog')
    expect(catalogHref({ page: 1 })).toBe('/catalog')
    expect(catalogHref({ series: 'dreamscape', subject: 'Art and craft', q: 'a&b', page: 2 })).toBe('/catalog?series=dreamscape&subject=Art+and+craft&q=a%26b&page=2')
  })

  it('pageList shows the ends and a window around the current page', () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3])
    expect(pageList(1, 10)).toEqual([1, 2, 3, 'gap', 10])
    expect(pageList(6, 12)).toEqual([1, 'gap', 4, 5, 6, 7, 8, 'gap', 12])
    expect(pageList(1, 1)).toEqual([1])
  })
})
