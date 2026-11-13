'use client'

import { useMemo, useState } from 'react'
import { Search, ArrowUpRight } from 'lucide-react'
import { books, type Book } from '@/lib/books'

function BookCover({ book, index }: { book: Book; index: number }) {
  return <div className="book-cover" style={{ '--cover': book.color, '--cover-ink': book.accent } as React.CSSProperties}>
    <span className="cover-kicker">LEARN AND GROW PRESS</span>
    <span className={`cover-art cover-art-${index % 4}`} aria-hidden="true"><i /><i /><i /></span>
    <span className="cover-title">{book.title}</span>
    <span className="cover-mark">{book.mark}</span>
    <span className="cover-author">{book.author}</span>
  </div>
}

export function BookCard({ book, index }: { book: Book; index: number }) {
  return <article className="book-card">
    <a className="book-cover-link" href={process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=${encodeURIComponent(`Tell me about ${book.title}`)}` : "/#contact"} aria-label={`Enquire about ${book.title}`}><BookCover book={book} index={index} /><span className="cover-action"><ArrowUpRight aria-hidden="true" /></span></a>
    <div className="book-meta"><div><span className="book-category">{book.category}</span><h3>{book.title}</h3><p>{book.subtitle}</p></div><span className="book-age">{book.age}</span></div>
  </article>
}

export function BookCatalog() {
  const [category, setCategory] = useState('All books')
  const [query, setQuery] = useState('')
  const categories = ['All books', 'Practical life', 'Nature', 'Culture & science', 'Language']
  const filtered = useMemo(() => books.filter(book => (category === 'All books' || book.category === category) && `${book.title} ${book.subtitle} ${book.author} ${book.category}`.toLowerCase().includes(query.toLowerCase())), [category, query])
  return <>
    <section className="catalog-intro"><p className="eyebrow">THE LEARN AND GROW LIBRARY</p><h1>Books for a life<br /><em>of discovery.</em></h1><p>Thoughtful books for the hands, hearts and imaginations of growing minds.</p></section>
    <section className="catalog-section" aria-label="Browse our books">
      <div className="catalog-toolbar"><div className="filters" aria-label="Filter by subject">{categories.map(item => <button key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search aria-hidden="true" /><span className="sr-only">Search books</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a book" /></label></div>
      <p className="results-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'title' : 'titles'} in the collection</p>
      {filtered.length ? <div className="book-grid">{filtered.map((book) => <BookCard key={book.title} book={book} index={books.indexOf(book)} />)}</div> : <div className="empty-results"><h2>No books found</h2><p>Try another title or subject.</p><button className="text-link" onClick={() => { setQuery(''); setCategory('All books') }}>Clear filters <ArrowUpRight aria-hidden="true" /></button></div>}
    </section>
  </>
}
