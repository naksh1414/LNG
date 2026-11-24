const isProd = process.env.NODE_ENV === 'production'

// Inline scripts and styles are needed by Next itself (no nonce set up), so those stay 'unsafe-inline'.
// Everything else is locked to this site plus the image host used for uploaded covers.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // The dev server needs eval and websockets for hot reload, so the policy is production only.
          ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
        ],
      },
      // Signed-in pages and their API must never be stored by a browser or shared cache.
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ]
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
}

export default nextConfig
