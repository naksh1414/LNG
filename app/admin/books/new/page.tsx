import { redirect } from 'next/navigation'

// A book is added from its series page.
export default function NewBookPage() {
  redirect('/admin/series')
}
