import { useEffect, useRef } from 'react'

// One AbortController per mount: in-flight requests are cancelled when the component unmounts.
// Created inside the effect so React Strict Mode's mount, unmount, mount cycle gets a fresh, live controller.
export function useAbortSignal(): () => AbortSignal | undefined {
  const ref = useRef<AbortController | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    ref.current = controller
    return () => {
      controller.abort()
      ref.current = null
    }
  }, [])
  return () => ref.current?.signal
}

export const isAbort = (err: unknown): boolean => err instanceof DOMException && err.name === 'AbortError'
