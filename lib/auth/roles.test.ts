import { describe, expect, it } from 'vitest'
import { AREAS, BUILTIN, can, GRANTABLE, isBuiltin, levelsFor, noAccess, type Area } from './roles'

const allowed = (key: keyof typeof BUILTIN, level: 'read' | 'write') => AREAS.filter((a) => can(BUILTIN[key].permissions, a, level))

describe('roles', () => {
  it('owner can do everything; editor writes series, books and testimonials; viewer only reads series and books', () => {
    expect(allowed('owner', 'write').sort()).toEqual([...AREAS].filter((a) => a !== 'metrics' && a !== 'audit').sort())
    expect(allowed('owner', 'read')).toEqual([...AREAS])
    expect(allowed('editor', 'write')).toEqual(['catalog', 'testimonials'])
    expect(allowed('editor', 'read')).toEqual(['catalog', 'testimonials'])
    expect(allowed('viewer', 'read')).toEqual(['catalog'])
    expect(allowed('viewer', 'write')).toEqual([])
  })

  it('write includes read, none grants nothing, and users is never grantable to a custom role', () => {
    const p = { ...noAccess(), catalog: 'write' as const, audit: 'read' as const }
    expect(can(p, 'catalog')).toBe(true)
    expect(can(p, 'audit', 'write')).toBe(false)
    expect(can(p, 'enquiries')).toBe(false)
    expect(GRANTABLE).not.toContain('users' as Area)
    expect(levelsFor('metrics')).toEqual(['none', 'read'])
    expect(isBuiltin('owner')).toBe(true)
    expect(isBuiltin('constructor')).toBe(false)
  })
})
