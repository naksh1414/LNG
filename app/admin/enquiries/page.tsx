import type { Metadata } from 'next'
import { EnquiryList } from '@/components/admin/enquiry-list'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { listEnquiries } from '@/lib/enquiries/repo'

export const metadata: Metadata = { title: 'Enquiries' }
export const dynamic = 'force-dynamic'

export default async function AdminEnquiriesPage() {
  await requireAdminPage()
  const enquiries = await listEnquiries()
  const unread = enquiries.filter((e) => !e.read).length
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Enquiries</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'}, {unread} new. Sent from the contact form and book pages.
      </p>
      <EnquiryList enquiries={enquiries} />
    </>
  )
}
