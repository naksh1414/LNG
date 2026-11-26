import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { Wordmark } from '@/components/wordmark'
import { currentAdmin } from '@/lib/auth/require-admin'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage() {
  // currentAdmin, not just the cookie: a disabled user with a live cookie must see this page, not loop.
  if (await currentAdmin()) redirect('/admin')
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-4 py-12">
      <Wordmark />
      <h1 className="mt-10 text-2xl font-bold text-foreground">Sign in to the admin</h1>
      <div className="mt-6 rounded-lg border border-border p-6">
        <LoginForm />
      </div>
    </div>
  )
}
