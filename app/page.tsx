import Link from 'next/link'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { BookCard } from '@/components/book-catalog'
import { books } from '@/lib/books'
import { SiteHeader } from '@/components/site-header'
import { ContactForm } from '@/components/contact-form'

export default function Page() {
  return <>
    <SiteHeader />
    <main>
      <section className="home-hero">
        <div className="hero-copy"><p className="eyebrow">INDEPENDENT PUBLISHERS · FOR CURIOUS MINDS</p><h1>Room to grow.<br /><em>Worlds to discover.</em></h1><p className="hero-description">We make considered books that invite children to follow their curiosity, find their own way and fall in love with learning.</p><div className="hero-actions"><Link href="/catalog" className="button-primary">Explore the books <ArrowRight aria-hidden="true" /></Link><a href="#approach" className="button-quiet">A little about us <ArrowDownRight aria-hidden="true" /></a></div></div>
        <div className="hero-image-wrap"><img className="hero-image" src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85" alt="A young child absorbed in a book at a sunlit table" fetchPriority="high" /><div className="image-note">A good book leaves<br />room for the reader.</div><span className="hero-image-caption">MADE FOR THE MOMENT THEY ASK WHY.</span></div>
        <span className="hero-index">01 — 03</span>
      </section>
      <section className="intro-strip" id="approach"><span className="section-index">01 / OUR POINT OF VIEW</span><p>Children are not empty vessels.<br />They&apos;re <em>already full of questions.</em></p><span className="strip-note">Our work begins with the belief that the best learning happens when a child is free to follow what interests them.</span></section>
      <section className="featured-section"><div className="section-heading"><div><p className="eyebrow">A FEW GOOD PLACES TO START</p><h2>From our shelves</h2></div><Link href="/catalog" className="text-link">Browse all titles <ArrowUpRight aria-hidden="true" /></Link></div><div className="book-grid featured-grid">{books.slice(0, 4).map((book, i) => <BookCard key={book.title} book={book} index={i} />)}</div></section>
      <section className="educator-band" id="educators"><div className="educator-number">02</div><div><p className="eyebrow">FOR THE GROWN-UPS BESIDE THEM</p><h2>Good company for<br /><em>the guides, too.</em></h2></div><p className="educator-copy">Whether you&apos;re a Montessori guide, a librarian or a parent looking for the right next book, we&apos;re glad you&apos;re here.</p><a className="educator-link" href="/#contact">Let&apos;s talk about your classroom <ArrowUpRight aria-hidden="true" /></a></section>
      <section className="contact-section" id="contact"><div className="contact-intro"><p className="eyebrow">GET IN TOUCH</p><h2>Let&apos;s start<br /><em>a conversation.</em></h2><p>Questions about a title, classroom orders or working with us? Send a note and we&apos;ll be in touch.</p></div><ContactForm /></section>
    </main>
    <footer className="site-footer"><Link href="/" className="wordmark"><span className="wordmark-mark" aria-hidden="true">LG</span><span>LEARN AND GROW<span className="wordmark-sub">PRESS · EST. 2012</span></span></Link><span>Books made with care, for the curious.</span><a href={process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}` : "#contact"}>Say hello <ArrowUpRight aria-hidden="true" /></a><small>© 2026 LEARN AND GROW</small></footer>
  </>
}
