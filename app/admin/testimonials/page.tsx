import type { Metadata } from 'next'
import { TestimonialManager } from '@/components/admin/testimonial-manager'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { can } from '@/lib/auth/roles'
import { listTestimonials } from '@/lib/testimonials/repo'

export const metadata: Metadata = { title: 'Testimonials' }
export const dynamic = 'force-dynamic'

export default async function AdminTestimonialsPage() {
  const me = await requireAdminPage('testimonials')
  const items = await listTestimonials()
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Testimonials</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Published ones show on the home page under “What readers say” (newest six). The section hides when none are published.
      </p>
      <TestimonialManager initial={items} readOnly={!can(me.permissions, 'testimonials', 'write')} />
    </>
  )
}
