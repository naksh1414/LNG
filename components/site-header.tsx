'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="Learn and Grow home">
          <span className="wordmark-mark" aria-hidden="true">LG</span>
          <span>LEARN AND GROW<span className="wordmark-sub">PRESS · EST. 2012</span></span>
        </Link>
        <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <Link href="/catalog" onClick={() => setOpen(false)}>Books</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <a href="/#educators" onClick={() => setOpen(false)}>For educators</a>
          <a className="nav-contact" href="/#contact" onClick={() => setOpen(false)}>Get in touch <ArrowUpRight aria-hidden="true" /></a>
        </nav>
      </div>
    </header>
  )
}
