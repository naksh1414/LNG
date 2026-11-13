import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'
import nextConfig from '../next.config.mjs'

describe('tooling', () => {
  it('alias @ resolves', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('next config does not ignore build errors', () => {
    expect((nextConfig as { typescript?: { ignoreBuildErrors?: boolean } }).typescript?.ignoreBuildErrors).not.toBe(true)
  })
})
