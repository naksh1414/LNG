import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { Wordmark } from '@/components/wordmark'
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage() {
  if (await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value)) redirect('/admin/series')
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
