import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubjectMark } from './subject-mark'

describe('SubjectMark', () => {
  it('draws a distinct, hidden mark for each known subject and a fallback otherwise', () => {
    const subjects = ['Culture & science', 'Nature', 'Language', 'Practical life', 'Music']
    const marks = subjects.map((s) => render(<SubjectMark subject={s} />).container.querySelector('svg')!)
    for (const svg of marks) expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(new Set(marks.map((svg) => svg.innerHTML)).size).toBe(subjects.length)
  })
})
