import { redirect } from 'next/navigation'

// Books are managed inside their series.
export default function AdminBooksPage() {
  redirect('/admin/series')
}
