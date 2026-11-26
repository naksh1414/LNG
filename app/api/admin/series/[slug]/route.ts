import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'
import { listAdminSeries, setSeriesLogo } from '@/lib/series/repo'
import { logoUrlSchema } from '../route'

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const auth = await requireAdmin(request, 'catalog', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = z.object({ logoUrl: logoUrlSchema }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Upload the logo again.' }, { status: 400 })
  try {
    const { slug } = await params
    const series = (await listAdminSeries()).find((s) => s.slug === slug)
    if (!series) return Response.json({ error: 'Series not found.' }, { status: 404 })
    await setSeriesLogo(series.name, parsed.data.logoUrl)
    await audit(request, auth, 'series_logo_changed', { type: 'series', label: series.name })
    revalidatePath('/catalog')
    revalidatePath('/admin/series')
    return Response.json({ ok: true })
  } catch (err) {
    return serverError('set series logo', err)
  }
}
