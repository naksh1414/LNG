import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Reveal } from './reveal'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))
})
afterEach(() => vi.unstubAllGlobals())

it('reveal renders children visible when prefers-reduced-motion is reduce', () => {
  render(<Reveal><p>Hello</p></Reveal>)
  const el = screen.getByText('Hello')
  expect(el).toBeVisible()
  expect(el.parentElement?.style.opacity ?? '').not.toBe('0')
})
