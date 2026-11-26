import { describe, expect, it } from 'vitest'
import { catalogHref, pageList, parseCatalogQuery } from './catalog-query'

describe('catalog query', () => {
  it('keeps a known subject, a trimmed search and a valid page; drops the rest', () => {
    expect(parseCatalogQuery({ subject: 'Nature', q: '  owl ', page: '3' }, ['Nature'])).toEqual({ subject: 'Nature', q: 'owl', page: 3 })
    expect(parseCatalogQuery({ subject: 'Nope' }, ['Nature']).subject).toBeUndefined()
    expect(parseCatalogQuery({ page: '-4' }, []).page).toBe(1)
    expect(parseCatalogQuery({ page: 'abc' }, []).page).toBe(1)
    expect(parseCatalogQuery({ subject: ['a', 'b'], q: ['x'] }, ['a']).q).toBe('')
    expect(parseCatalogQuery({ q: 'x'.repeat(500) }, []).q).toHaveLength(80)
  })

  it('catalogHref leaves out defaults and encodes values', () => {
    expect(catalogHref({})).toBe('/catalog')
    expect(catalogHref({ page: 1 })).toBe('/catalog')
    expect(catalogHref({ subject: 'Art and craft', q: 'a&b', page: 2 })).toBe('/catalog?subject=Art+and+craft&q=a%26b&page=2')
  })

  it('pageList shows the ends and a window around the current page', () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3])
    expect(pageList(1, 10)).toEqual([1, 2, 3, 'gap', 10])
    expect(pageList(6, 12)).toEqual([1, 'gap', 4, 5, 6, 7, 8, 'gap', 12])
    expect(pageList(1, 1)).toEqual([1])
  })
})
