import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'

it('focus ring classes: no outline-none, a focus-visible outline is present', () => {
  render(
    <>
      <Button variant="primary">a</Button>
      <Button variant="quiet">b</Button>
      <Input aria-label="i" />
      <Textarea aria-label="t" />
    </>,
  )
  for (const el of [...screen.getAllByRole('button'), screen.getByLabelText('i'), screen.getByLabelText('t')]) {
    expect(el.className).not.toContain('outline-none')
    expect(el.className).toMatch(/focus-visible:outline-/)
  }
})
