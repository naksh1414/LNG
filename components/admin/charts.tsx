// Server-rendered SVG charts: no chart library, no client JS.
const SERIES_COLOURS = ['#d61f8a', '#2d5ba6', '#fdcc2d', '#6cc24a', '#7c5cbf']

const dayLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })

// Round the top of the axis up so gridlines land on tidy numbers.
function niceMax(max: number): number {
  if (max <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(max))
  return ([1, 2, 2.5, 5, 10].find((m) => m * pow >= max) ?? 10) * pow
}

export function AreaChart({ points, label, unit }: { points: { day: string; value: number }[]; label: string; unit: string }) {
  const W = 640
  const H = 190
  const pad = { l: 36, r: 10, t: 10, b: 24 }
  const top = niceMax(Math.max(...points.map((p) => p.value), 0))
  const x = (i: number) => pad.l + (points.length > 1 ? (i / (points.length - 1)) * (W - pad.l - pad.r) : 0)
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`
  const total = points.reduce((s, p) => s + p.value, 0)
  const peak = points.reduce((a, p) => (p.value > a.value ? p : a), points[0])
  const ticks = [0, top / 2, top]
  const labelled = [0, Math.floor((points.length - 1) / 2), points.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}. ${total} in total, busiest day ${dayLabel(peak.day)} with ${peak.value}.`} className="h-auto w-full text-accent">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-border" strokeWidth="1" />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="currentColor" className="text-muted-foreground">
            {Math.round(t)}
          </text>
        </g>
      ))}
      <path d={area} fill="currentColor" opacity="0.12" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <rect key={p.day} x={x(i) - (W - pad.l - pad.r) / points.length / 2} y={pad.t} width={(W - pad.l - pad.r) / points.length} height={H - pad.t - pad.b} fill="transparent">
          <title>{`${dayLabel(p.day)}: ${p.value} ${unit}`}</title>
        </rect>
      ))}
      {labelled.map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} fontSize="11" fill="currentColor" className="text-muted-foreground">
          {dayLabel(points[i].day)}
        </text>
      ))}
    </svg>
  )
}

export function BarColumns({ points, label, unit }: { points: { day: string; value: number }[]; label: string; unit: string }) {
  const W = 640
  const H = 130
  const pad = { l: 36, r: 10, t: 8, b: 22 }
  const top = niceMax(Math.max(...points.map((p) => p.value), 0))
  const slot = (W - pad.l - pad.r) / points.length
  const total = points.reduce((s, p) => s + p.value, 0)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}. ${total} in total.`} className="h-auto w-full text-band">
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="currentColor" className="text-border" />
      <text x={pad.l - 6} y={pad.t + 8} textAnchor="end" fontSize="11" fill="currentColor" className="text-muted-foreground">
        {top}
      </text>
      {points.map((p, i) => {
        const h = (p.value / top) * (H - pad.t - pad.b)
        return (
          <rect key={p.day} x={pad.l + i * slot + slot * 0.15} y={H - pad.b - h} width={slot * 0.7} height={Math.max(h, p.value ? 2 : 0)} rx="2" fill="currentColor">
            <title>{`${dayLabel(p.day)}: ${p.value} ${unit}`}</title>
          </rect>
        )
      })}
      <text x={pad.l} y={H - 6} fontSize="11" fill="currentColor" className="text-muted-foreground">{dayLabel(points[0].day)}</text>
      <text x={W - pad.r} y={H - 6} textAnchor="end" fontSize="11" fill="currentColor" className="text-muted-foreground">{dayLabel(points[points.length - 1].day)}</text>
    </svg>
  )
}

export function Donut({ rows, label }: { rows: { label: string; n: number }[]; label: string }) {
  const total = rows.reduce((s, r) => s + r.n, 0)
  const R = 38
  const C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${rows.map((r) => `${r.label} ${r.n}`).join(', ')}`} className="size-32 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" className="text-border" strokeWidth="14" />
        {rows.map((r, i) => {
          const len = total ? (r.n / total) * C : 0
          const el = (
            <circle key={r.label} cx="50" cy="50" r={R} fill="none" stroke={SERIES_COLOURS[i % SERIES_COLOURS.length]} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}>
              <title>{`${r.label}: ${r.n}`}</title>
            </circle>
          )
          offset += len
          return el
        })}
      </svg>
      <ul className="grid gap-2 text-sm">
        {rows.map((r, i) => (
          <li key={r.label} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ background: SERIES_COLOURS[i % SERIES_COLOURS.length] }} />
            <span className="capitalize">{r.label}</span>
            <span className="ml-auto pl-4 tabular-nums text-muted-foreground">
              {r.n} ({total ? Math.round((r.n / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BarList({ rows, empty }: { rows: { label: string; n: number; note?: string }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <ul className="grid gap-3">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="flex justify-between gap-4 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="tabular-nums text-muted-foreground">{r.note ?? r.n}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-border">
            <div className="h-full rounded-full" style={{ width: `${(r.n / max) * 100}%`, background: SERIES_COLOURS[i % SERIES_COLOURS.length] }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
