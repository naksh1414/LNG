import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const site = vi.hoisted(() => ({ whatsappNumber: '+91 98765 43210' as string | undefined }))
vi.mock('@/lib/site', () => ({ site }))

import { EnquiryForm } from './enquiry-form'

const open = vi.fn()

beforeEach(() => {
  site.whatsappNumber = '+91 98765 43210'
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

describe('EnquiryForm', () => {
  it('submits, saves, then opens the WhatsApp URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<EnquiryForm book={{ id: 'b1', title: 'Owl' }} />)
    await fill(user)
    await user.click(screen.getByRole('button', { name: /send enquiry/i }))
    await waitFor(() => expect(open).toHaveBeenCalled())
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({ name: 'Asha', bookId: 'b1', website: '' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/enquiries')
    const [url, target, features] = open.mock.calls[0]
    expect(url).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/)
    expect(decodeURIComponent(url)).toContain('I am asking about "Owl".')
    expect(target).toBe('_blank')
    expect(features).toContain('noopener')
  })

  it('still opens WhatsApp when the save request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const user = userEvent.setup()
    render(<EnquiryForm />)
    await fill(user)
    await user.click(screen.getByRole('button', { name: /send enquiry/i }))
    await waitFor(() => expect(open).toHaveBeenCalled())
  })

  it('with an invalid number shows the saved message and renders no wa.me link', async () => {
    site.whatsappNumber = 'abc'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 201 })))
    const user = userEvent.setup()
    const { container } = render(<EnquiryForm />)
    await fill(user)
    await user.click(screen.getByRole('button', { name: /send enquiry/i }))
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
    await user.click(screen.getByRole('button', { name: /send enquiry/i }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/could not send/i)
    expect((screen.getByRole('button', { name: /send enquiry/i }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('shows inline errors and does not submit when a required field is empty', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<EnquiryForm />)
    await user.click(screen.getByRole('button', { name: /send enquiry/i }))
    expect(screen.getByText('Enter your name.')).toBeTruthy()
    expect(screen.getByText('Enter a phone number or email.')).toBeTruthy()
    expect(screen.getByText('Enter a message.')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
  })
})
