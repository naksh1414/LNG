import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

export const metadata = {
  title: 'About us',
  description: 'Meet LEARN AND GROW, an independent publisher of Montessori-inspired books for curious children, families and educators.',
}

const principles = [
  {
    number: '01',
    title: 'Follow the question',
    copy: 'A child’s curiosity is a wonderful place to begin. Our books invite exploration instead of rushing to the answer.',
  },
  {
    number: '02',
    title: 'Respect their pace',
    copy: 'Every child meets the world in their own way. We make thoughtful books that leave room for different paths and discoveries.',
  },
  {
    number: '03',
    title: 'Make learning tangible',
    copy: 'Clear language, considered details and hands-on ideas help children connect what they read with the world around them.',
  },
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="about-page">
        <section className="about-hero">
          <p className="eyebrow">A LITTLE ABOUT US</p>
          <h1>Books for the<br /><em>way children wonder.</em></h1>
          <p className="about-lede">LEARN AND GROW is an independent publishing house creating Montessori-inspired books for curious children and the grown-ups learning alongside them.</p>
        </section>

        <section className="about-story" id="approach">
          <p className="section-index">01 / OUR POINT OF VIEW</p>
          <div className="about-story-copy">
            <h2>Children are not empty vessels.<br /><em>They arrive full of questions.</em></h2>
            <p>We believe a good book can open a door, then give a child the time and space to walk through it. That belief shapes what we publish: inviting stories, useful ideas and beautiful details made to be returned to.</p>
            <p>Guided by Montessori principles, our work begins with respect for children as capable, active learners. We create books for home, classroom and everywhere a new question takes root.</p>
          </div>
        </section>

        <section className="about-principles">
          <div className="section-heading">
            <div><p className="eyebrow">WHAT GUIDES THE WORK</p><h2>Small things, thoughtfully made.</h2></div>
          </div>
          <div className="principle-grid">
            {principles.map((principle) => (
              <article className="principle-card" key={principle.number}>
                <span className="principle-number">{principle.number}</span>
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-invitation">
          <p className="eyebrow">FOR READERS, FAMILIES & EDUCATORS</p>
          <h2>Find a book to begin with.</h2>
          <p>Whether you’re choosing a first title or building a classroom shelf, we’d love to help you find the right place to start.</p>
          <div className="hero-actions">
            <Link href="/catalog" className="button-primary">Explore the books <ArrowRight aria-hidden="true" /></Link>
            <Link href="/#contact" className="button-quiet">Get in touch <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <Link href="/" className="wordmark"><span className="wordmark-mark" aria-hidden="true">LG</span><span>LEARN AND GROW<span className="wordmark-sub">PRESS · EST. 2012</span></span></Link>
        <span>Books made with care, for the curious.</span>
        <a href={process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}` : '/#contact'}>Say hello <ArrowUpRight aria-hidden="true" /></a>
        <small>© 2026 LEARN AND GROW</small>
      </footer>
    </>
  )
}
