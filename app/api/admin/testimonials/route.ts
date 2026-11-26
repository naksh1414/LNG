import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'
import { testimonialSchema } from '@/lib/testimonials/schema'
import { createTestimonial } from '@/lib/testimonials/repo'

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request, 'testimonials', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = testimonialSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const fields = Object.fromEntries(Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, (v as string[])[0]]))
    return Response.json({ error: 'Check the highlighted fields.', fields }, { status: 400 })
  }
  try {
    const item = await createTestimonial(parsed.data)
    await audit(request, auth, 'testimonial_created', { type: 'testimonial', id: item.id, label: item.name })
    revalidatePath('/')
    return Response.json({ testimonial: item }, { status: 201 })
  } catch (err) {
    return serverError('create testimonial', err)
  }
}
