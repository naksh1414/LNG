import { Reveal } from '@/components/reveal'
import type { Testimonial } from '@/lib/testimonials/repo'

function Card({ q, hidden }: { q: Testimonial; hidden?: boolean }) {
  return (
    <li aria-hidden={hidden || undefined} className="mr-4 flex w-[82vw] shrink-0 flex-col justify-between gap-6 rounded-3xl border border-border bg-field p-6 sm:w-96 md:mr-5">
      <blockquote className="text-lg leading-relaxed">“{q.quote}”</blockquote>
      <p className="flex items-center gap-3 text-sm">
        <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-tint font-bold">{q.name[0]}</span>
        <span>
          <span className="block font-semibold">{q.name}</span>
          {q.role && <span className="block text-muted-foreground">{q.role}</span>}
        </span>
      </p>
    </li>
  )
}

// Managed in the admin panel (Testimonials); the section hides until one is published.
// The cards loop forever and pause on hover or focus; with reduced motion they sit still and scroll sideways.
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null
  const shown = items.slice(0, 8)
  // Repeat short lists so one half is always wider than a big screen, or the loop would show a gap.
  const half = Array.from({ length: Math.ceil(8 / shown.length) * shown.length }, (_, i) => shown[i % shown.length])
  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-8 md:py-12">
      <Reveal>
        <h2 id="testimonials-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
          What readers say
        </h2>
        <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">Kind words from parents, teachers and schools.</p>
      </Reveal>
      <div
        className="marquee-wrap mt-8 overflow-x-auto motion-safe:overflow-hidden motion-safe:[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
      >
        <ul className="marquee flex w-max" style={{ '--marquee-s': `${half.length * 7}s` } as React.CSSProperties}>
          {half.map((q, i) => (
            <Card key={`a${i}`} q={q} />
          ))}
          {/* The second half only exists to make the loop seamless, so screen readers skip it. */}
          {half.map((q, i) => (
            <Card key={`b${i}`} q={q} hidden />
          ))}
        </ul>
      </div>
    </section>
  )
}
