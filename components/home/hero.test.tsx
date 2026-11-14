import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeBook } from './fixtures'
import { Hero } from './hero'
import { SubjectsRow } from './subjects-row'

describe('Hero', () => {
  it('hero has one h1, one primary and one secondary action, and a subtext of 20 words or fewer', () => {
    render(<Hero books={[makeBook('One'), makeBook('Two'), makeBook('Three')]} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Montessori books for homes and classrooms.')
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Browse books' })).toHaveAttribute('href', '/catalog')
    expect(screen.getByRole('link', { name: 'For schools' })).toHaveAttribute('href', '/#schools')
    const sub = screen.getByTestId('hero-subtext').textContent ?? ''
    expect(sub.trim().split(/\s+/).length).toBeLessThanOrEqual(20)
    expect(screen.getByTestId('cover-fan')).toBeInTheDocument()
  })

  it('hero renders with zero books (no cover fan, no crash)', () => {
    render(<Hero books={[]} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByTestId('cover-fan')).toBeNull()
  })
})

describe('SubjectsRow', () => {
  it('subjects row links to the filtered catalogue', () => {
    render(<SubjectsRow subjects={['Nature', 'Practical Life']} />)
    expect(screen.getByRole('link', { name: /Nature/ })).toHaveAttribute('href', '/catalog?subject=Nature')
    expect(screen.getByRole('link', { name: /Practical Life/ })).toHaveAttribute(
      'href',
      '/catalog?subject=Practical%20Life',
    )
  })
})
