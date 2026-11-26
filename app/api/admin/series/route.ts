import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'
import { createSeries } from '@/lib/series/repo'

export const logoUrlSchema = z
  .union([z.url({ protocol: /^https$/ }), z.string().regex(/^\/uploads\/[\w.-]+$/)])
  .nullable()

const schema = z.object({
  name: z.string().trim().min(1, 'Enter a series name.').max(120, 'Use 120 characters or fewer.'),
  description: z.string().trim().max(500, 'Use 500 characters or fewer.'),
  logoUrl: logoUrlSchema.default(null),
})

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request, 'catalog', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const fields = Object.fromEntries(
      Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, (v as string[])[0]]),
    )
    return Response.json({ error: 'Check the highlighted fields.', fields }, { status: 400 })
  }
  try {
    if (!(await createSeries(parsed.data.name, parsed.data.description, parsed.data.logoUrl)))
      return Response.json({ error: 'Check the highlighted fields.', fields: { name: 'A series with this name already exists.' } }, { status: 409 })
    await audit(request, auth, 'series_created', { type: 'series', label: parsed.data.name })
    revalidatePath('/admin/series')
    return Response.json({ ok: true }, { status: 201 })
  } catch (err) {
    return serverError('create series', err)
  }
}
