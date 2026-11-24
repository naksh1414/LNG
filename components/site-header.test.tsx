import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SiteHeader } from './site-header'

describe('SiteHeader', () => {
  it('site-header renders one nav landmark with Books, About, For schools and Contact links', () => {
    render(<SiteHeader />)
    const navs = screen.getAllByRole('navigation')
    expect(navs).toHaveLength(1)
    const nav = within(navs[0])
    expect(nav.getByRole('link', { name: 'Catalogue' })).toHaveAttribute('href', '/catalog')
    expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(nav.getByRole('link', { name: 'For schools' })).toHaveAttribute('href', 'https://econtent.learnngrow.co.in/tg/')
    expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('menu toggle sets aria-expanded and shows links on small screens', async () => {
    render(<SiteHeader />)
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    const nav = screen.getByRole('navigation')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(nav).toHaveClass('hidden')
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(nav).not.toHaveClass('hidden')
  })
})
