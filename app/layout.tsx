import { Analytics } from '@vercel/analytics/next'
import { DM_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const bodyFont = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const headingFont = localFont({
  src: [
    { path: './fonts/InterMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/InterMono-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/InterMono-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'LEARN AND GROW — Books for curious minds', template: '%s | LEARN AND GROW' },
  description: 'Independent Montessori-inspired books for curious children, families and educators. Discover thoughtful reads from LEARN AND GROW.',
  generator: 'Next.js',
  openGraph: {
    title: 'LEARN AND GROW — Books for curious minds',
    description: 'Thoughtful books that invite children to follow their curiosity and fall in love with learning.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f5ee',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
