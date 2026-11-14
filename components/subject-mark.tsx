import { cn } from '@/lib/utils'

// One plain geometric mark per subject, shared by the generated covers and the subject list.
function shapes(subject: string) {
  const s = subject.toLowerCase()
  if (/science|culture/.test(s))
    return (
      <>
        <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="24" cy="24" r="4.5" />
        <circle cx="37" cy="13" r="5" />
      </>
    )
  if (/nature/.test(s))
    return (
      <>
        <path d="M22.5 42V26C12 26 6 20 6 10c11 0 17 6 17 14V20c0-8 6-14 19-14 0 11-6 16-16.5 16.5V42Z" />
      </>
    )
  if (/language|word|read/.test(s))
    return (
      <>
        <rect x="6" y="9" width="36" height="6" />
        <rect x="6" y="21" width="27" height="6" />
        <rect x="6" y="33" width="17" height="6" />
      </>
    )
  if (/practical|life/.test(s))
    return (
      <>
        <rect x="6" y="6" width="16" height="16" />
        <rect x="26" y="6" width="16" height="16" />
        <rect x="6" y="26" width="16" height="16" />
        <rect x="27.5" y="27.5" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" />
      </>
    )
  return (
    <>
      <circle cx="16" cy="24" r="10" />
      <rect x="28" y="14" width="16" height="20" />
    </>
  )
}

export function SubjectMark({ subject, className }: { subject: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false" className={cn('block', className)}>
      {shapes(subject)}
    </svg>
  )
}
