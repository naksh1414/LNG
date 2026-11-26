import { useCallback, useEffect, useRef, useState } from 'react'

// Value that follows `value` only after it has been still for `ms`; the pending timer is cleared on change and unmount.
export function useDebouncedValue<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

// Leading-edge throttle: runs at once, then ignores calls for `ms`. Stable identity, always calls the latest fn.
export function useThrottle<A extends unknown[]>(fn: (...args: A) => void, ms = 300): (...args: A) => void {
  const last = useRef(0)
  const latest = useRef(fn)
  useEffect(() => {
    latest.current = fn
  })
  return useCallback(
    (...args: A) => {
      const now = Date.now()
      if (now - last.current < ms) return
      last.current = now
      latest.current(...args)
    },
    [ms],
  )
}
