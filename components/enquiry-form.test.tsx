import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const site = vi.hoisted(() => ({ whatsappNumber: '+91 98765 43210' as string | undefined }))
vi.mock('@/lib/site', () => ({ site }))

import { EnquiryForm } from './enquiry-form'

const open = vi.fn()
let win: { location: { href: string }; opener: unknown }

beforeEach(() => {
  site.whatsappNumber = '+91 98765 43210'
  win = { location: { href: '' }, opener: {} }
  open.mockReturnValue(win)
  vi.stubGlobal('open', open)
})
afterEach(() => {
  vi.unstubAllGlobals()
  open.mockReset()
})

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/your name/i), 'Asha')
  await user.type(screen.getByLabelText(/phone or email/i), 'a@b.in')
  await user.type(screen.getByLabelText(/message/i), 'Do you ship?')
}

const send = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: /send enquiry/i }))

describe('EnquiryForm', () => {
  it('opens the window before the save resolves, then navigates it after save', async () => {
    let resolveFetch!: (r: Response) => void
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((r) => (resolveFetch = r)))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<EnquiryForm book={{ id: 'b1', title: 'Owl' }} />)
    await fill(user)
    await send(user)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(open).toHaveBeenCalledWith('about:blank', '_blank')
    expect(win.location.href).toBe('')
    resolveFetch(new Response('{"id":"1"}', { status: 201 }))
    await waitFor(() => expect(win.location.href).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/))
    expect(decodeURIComponent(win.location.href)).toContain('I am asking about "Owl".')
    expect(win.opener).toBeNull()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({ name: 'Asha', bookId: 'b1', website: '' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/enquiries')
    expect(await screen.findByText('Your enquiry was saved. We will contact you.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('status'))
    expect(screen.getByRole('link', { name: 'Open WhatsApp' })).toBeTruthy()
  })

  it('still opens WhatsApp when the save request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const user = userEvent.setup()
    render(<EnquiryForm />)
    await fill(user)
    await send(user)
    await waitFor(() => expect(win.location.href).toMatch(/wa\.me/))
  })

  it('shows a prominent Open WhatsApp link when the popup is blocked', async () => {
    open.mockReturnValue(null)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 201 })))
    const user = userEvent.setup()
    render(<EnquiryForm />)
    await fill(user)
    await send(user)
    const link = await screen.findByRole('link', { name: 'Open WhatsApp' })
    expect(link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.className).toContain('bg-accent')
  })

  it('with an invalid number opens nothing, shows the saved message and no wa.me link', async () => {
    site.whatsappNumber = 'abc'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 201 })))
    const user = userEvent.setup()
    const { container } = render(<EnquiryForm />)
    await fill(user)
    await send(user)
    expect(await screen.findByText('Your enquiry was saved. We will contact you.')).toBeTruthy()
    expect(open).not.toHaveBeenCalled()
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull()
  })

  it('shows an error with retry when the save fails and there is no number', async () => {
    site.whatsappNumber = undefined
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const user = userEvent.setup()
    render(<EnquiryForm />)
    await fill(user)
    await send(user)
    expect((await screen.findByRole('alert')).textContent).toMatch(/could not send/i)
    expect((screen.getByRole('button', { name: /send enquiry/i }) as HTMLButtonElement).disabled).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it('shows inline errors, focuses the first invalid field and does not submit', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<EnquiryForm />)
    await send(user)
    expect(screen.getByText('Enter your name.')).toBeTruthy()
    expect(screen.getByText('Enter a phone number or email.')).toBeTruthy()
    expect(screen.getByText('Enter a message.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText(/your name/i))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
  })
})
