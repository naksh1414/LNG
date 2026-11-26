import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from './hero'

describe('Hero', () => {
  it('hero has one h1, one primary and one secondary action, and a subtext of 20 words or fewer', () => {
    render(<Hero />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Montessori books for homes and classrooms.')
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Browse books' })).toHaveAttribute('href', '/catalog')
    expect(screen.getByRole('link', { name: 'For schools' })).toHaveAttribute('href', '/#schools')
    const sub = screen.getByTestId('hero-subtext').textContent ?? ''
    expect(sub.trim().split(/\s+/).length).toBeLessThanOrEqual(20)
  })

})
