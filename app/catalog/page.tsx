import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { BookCatalog } from '@/components/book-catalog'

export default function CatalogPage() {
  return <><SiteHeader /><main className="catalog-page"><BookCatalog /></main><footer className="site-footer"><Link href="/" className="wordmark"><span className="wordmark-mark" aria-hidden="true">LG</span><span>LEARN AND GROW<span className="wordmark-sub">PRESS · EST. 2012</span></span></Link><span>Books made with care, for the curious.</span><a href={process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}` : "/#contact"}>Say hello</a><small>© 2026 LEARN AND GROW</small></footer></>
}
