import { expect, it } from 'vitest'
import { cn } from './utils'

it('co-located spec is picked up', () => {
  expect(cn('a', undefined, 'b')).toBe('a b')
})
