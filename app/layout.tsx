import { Analytics } from '@vercel/analytics/next'
import { Figtree } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import './globals.css'

const font = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'LEARN AND GROW - Books for curious minds', template: '%s | LEARN AND GROW' },
  description: 'Independent Montessori-inspired books for curious children, families and educators. Discover thoughtful reads from LEARN AND GROW.',
  generator: 'Next.js',
  openGraph: {
    title: 'LEARN AND GROW - Books for curious minds',
    description: 'Thoughtful books that invite children to follow their curiosity and fall in love with learning.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f4f2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={font.variable}>
      <body className="antialiased">
        {children}
        <AnalyticsTracker />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
