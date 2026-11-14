import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeBook } from '@/components/home/fixtures'
import { BookForm } from './book-form'
import { BookTable } from './book-table'

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const fetchMock = vi.fn()
beforeEach(() => {
  fetchMock.mockReset()
  router.push.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Title'), 'Seed to Tree')
  await user.type(screen.getByLabelText('Author'), 'A. Writer')
  await user.type(screen.getByLabelText('Subject'), 'Nature')
}

describe('BookForm', () => {
  it('shows field errors from the API', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue(json(409, { error: 'Check the highlighted fields.', fields: { slug: 'Another book already uses this slug.' } }))
    render(<BookForm />)
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: 'Create book' }))

    const slug = screen.getByLabelText('Slug')
    await waitFor(() => expect(slug).toHaveAttribute('aria-invalid', 'true'))
    expect(slug).toHaveAccessibleDescription(expect.stringContaining('Another book already uses this slug.'))
    expect(screen.getByRole('alert')).toHaveTextContent('Check the highlighted fields.')
    expect(router.push).not.toHaveBeenCalled()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/books')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toMatchObject({ title: 'Seed to Tree', ageMin: 3, coverUrl: null, published: true })
  })

  it('shows a cover preview after upload', async () => {
    const user = userEvent.setup()
    const url = 'https://store.public.blob.vercel-storage.com/covers/abc.png'
    fetchMock.mockResolvedValue(json(200, { url }))
    render(<BookForm />)
    await user.upload(screen.getByLabelText('Cover image'), new File([new Uint8Array([1])], 'c.png', { type: 'image/png' }))

    const preview = await screen.findByRole('img', { name: /cover preview/i })
    expect(preview).toHaveAttribute('src', url)
    const [path, init] = fetchMock.mock.calls[0]
    expect(path).toBe('/api/admin/upload')
    expect((init.body as FormData).get('file')).toBeInstanceOf(File)
  })

  it('edits an existing book with PATCH and returns to the list', async () => {
    const user = userEvent.setup()
    const book = makeBook('Sky Book', 'Nature')
    fetchMock.mockResolvedValue(json(200, { book }))
    render(<BookForm book={book} />)
    expect(screen.getByLabelText('Title')).toHaveValue('Sky Book')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin/books'))
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/admin/books/${book.id}`)
    expect(fetchMock.mock.calls[0][1].method).toBe('PATCH')
  })
})

describe('BookTable', () => {
  it('delete asks for confirmation before calling the API', async () => {
    const user = userEvent.setup()
    const book = makeBook('Seed Book', 'Nature')
    fetchMock.mockResolvedValue(json(200, { ok: true }))
    render(<BookTable books={[book]} />)

    await user.click(screen.getByRole('button', { name: 'Delete Seed Book' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(fetchMock).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Seed Book' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Seed Book' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete book' }))
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Seed Book' })).not.toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/books/${book.id}`, expect.objectContaining({ method: 'DELETE' }))
  })

  it('toggles published with a PATCH of the whole book', async () => {
    const user = userEvent.setup()
    const book = makeBook('Seed Book', 'Nature')
    fetchMock.mockResolvedValue(json(200, { book: { ...book, published: false } }))
    render(<BookTable books={[book]} />)
    const toggle = screen.getByRole('switch', { name: 'Published: Seed Book' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    await user.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'false'))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ title: 'Seed Book', published: false })
  })
})

describe('admin books a11y', () => {
  it('binds every label, gives every control a focus class and an accessible name', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <>
        <BookForm book={{ ...makeBook('Sky Book'), coverUrl: 'https://s.public.blob.vercel-storage.com/c.png' }} />
        <BookTable books={[makeBook('Seed Book')]} />
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Delete Seed Book' }))
    await screen.findByRole('alertdialog')
    for (const label of document.querySelectorAll('label[for]')) {
      expect(document.getElementById(label.getAttribute('for')!)?.tagName).toMatch(/^(INPUT|TEXTAREA|SELECT)$/)
    }
    const controls = [
      ...screen.getAllByRole('link', { hidden: true }),
      ...screen.getAllByRole('button', { hidden: true }),
      ...screen.getAllByRole('textbox', { hidden: true }),
      ...screen.getAllByRole('spinbutton', { hidden: true }),
      ...screen.getAllByRole('checkbox', { hidden: true }),
      ...screen.getAllByRole('switch', { hidden: true }),
      ...container.querySelectorAll('input[type=file]'),
    ].filter((el) => !el.hasAttribute('data-base-ui-focus-guard')) // invisible focus-trap sentinels
    for (const el of controls) {
      expect(el, el.outerHTML.slice(0, 160)).toHaveAccessibleName()
      expect(el.className, el.outerHTML.slice(0, 120)).toMatch(/focus-visible:outline-(2|\[)/)
    }
  })
})
