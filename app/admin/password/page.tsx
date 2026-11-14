import type { Metadata } from 'next'
import { PasswordForm } from '@/components/admin/password-form'

export const metadata: Metadata = { title: 'Change password' }

export default function PasswordPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Change password</h1>
      <PasswordForm />
    </>
  )
}
