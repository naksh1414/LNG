import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { setEnquiryRead } from '@/lib/enquiries/repo'
import { isCrossOrigin } from '@/lib/request'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = z.object({ read: z.boolean() }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid request.' }, { status: 400 })
  try {
    if (!(await setEnquiryRead((await params).id, parsed.data.read))) return Response.json({ error: 'Enquiry not found.' }, { status: 404 })
    return Response.json({ ok: true })
  } catch (err) {
    return serverError('mark enquiry', err)
  }
}
