import { describe, expect, it } from 'vitest'
import { makeBook } from '@/components/home/fixtures'
import { classRank, groupByClass, groupBySeries } from './hierarchy'

const b = (title: string, series: string, subject: string, classLevel: string) => ({ ...makeBook(title), series, subject, classLevel })

describe('book hierarchy', () => {
  it('groups series, then subjects, then orders books by class', () => {
    const groups = groupBySeries([
      b('C1', 'Dreamscape', 'Art', 'Class 1'),
      b('N', 'Dreamscape', 'Art', 'Nursery'),
      b('M', 'Dreamscape', 'Maths', 'UKG'),
      b('X', 'Other', 'Art', 'Class 2'),
    ])
    expect(groups.map((g) => g.slug)).toEqual(['dreamscape', 'other'])
    const art = groups[0].subjects.find((s) => s.slug === 'art')!
    expect(art.books.map((x) => x.title)).toEqual(['N', 'C1'])
    expect(groups[0].subjects).toHaveLength(2)
  })

  it('ranks pre-primary before numbered classes and groups books by class', () => {
    expect(classRank('UKG')).toBeLessThan(classRank('Class 1'))
    expect(classRank('Class 2')).toBeLessThan(classRank('Class 10'))
    const out = groupByClass([b('a', 's', 'x', 'Class 2'), b('b', 's', 'x', 'LKG'), b('c', 's', 'x', 'LKG')])
    expect(out.map((g) => [g.level, g.books.length])).toEqual([['LKG', 2], ['Class 2', 1]])
  })

  it('files books with no series or class under fallbacks', () => {
    expect(groupBySeries([b('Old', '', 'Art', '')])[0].name).toBe('More books')
    expect(groupByClass([b('Old', '', 'Art', '')])[0].level).toBe('All classes')
  })
})
