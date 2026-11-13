import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ErrorView from './error'

describe('ErrorView', () => {
  it('shows a composed message without details and retries via reset', async () => {
    const reset = vi.fn()
    render(<ErrorView error={new Error('MONGODB_URI is not set')} reset={reset} />)
    expect(screen.getByRole('heading', { name: 'We could not load the books right now.' })).toBeInTheDocument()
    expect(screen.queryByText(/MONGODB/)).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledTimes(1)
  })
})
