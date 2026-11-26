import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue, useThrottle } from './timing'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('timing hooks', () => {
  it('useDebouncedValue only updates after the value has been still, and clears its timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ v }) => useDebouncedValue(v, 200), { initialProps: { v: 'a' } })
    rerender({ v: 'ab' })
    act(() => void vi.advanceTimersByTime(150))
    rerender({ v: 'abc' })
    act(() => void vi.advanceTimersByTime(150))
    expect(result.current).toBe('a')
    act(() => void vi.advanceTimersByTime(60))
    expect(result.current).toBe('abc')
    rerender({ v: 'x' })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('useThrottle runs the first call, drops calls inside the window, then runs again', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useThrottle(fn, 300))
    result.current()
    result.current()
    expect(fn).toHaveBeenCalledTimes(1)
    vi.setSystemTime(Date.now() + 301)
    result.current()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
