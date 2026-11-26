import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'
import { testimonialSchema } from '@/lib/testimonials/schema'
import { deleteTestimonial, updateTestimonial } from '@/lib/testimonials/repo'

type Ctx = { params: Promise<{ id: string }> }
const notFound = () => Response.json({ error: 'Testimonial not found.' }, { status: 404 })

// Partial, so the publish toggle can send just { published }.
export async function PATCH(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'testimonials', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = testimonialSchema.partial().safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const fields = Object.fromEntries(Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, (v as string[])[0]]))
    return Response.json({ error: 'Check the highlighted fields.', fields }, { status: 400 })
  }
  try {
    const item = await updateTestimonial((await params).id, parsed.data)
    if (!item) return notFound()
    await audit(request, auth, 'testimonial_updated', { type: 'testimonial', id: item.id, label: item.name })
    revalidatePath('/')
    return Response.json({ testimonial: item })
  } catch (err) {
    return serverError('update testimonial', err)
  }
}

export async function DELETE(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'testimonials', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  try {
    const item = await deleteTestimonial((await params).id)
    if (!item) return notFound()
    await audit(request, auth, 'testimonial_deleted', { type: 'testimonial', id: item.id, label: item.name })
    revalidatePath('/')
    return Response.json({ ok: true })
  } catch (err) {
    return serverError('delete testimonial', err)
  }
}
