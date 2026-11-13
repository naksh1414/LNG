import type { BookInput } from './types'

type Row = [title: string, subtitle: string, author: string, subject: string, ageMin: number, ageMax: number]

const rows: Row[] = [
  ['The Quiet Observer', 'A child’s guide to noticing the world', 'Mira Ellison', 'Practical life', 3, 6],
  ['Small Hands, Big Work', 'Everyday independence, one task at a time', 'Nora James', 'Practical life', 2, 5],
  ['A Map of the Sky', 'Stories for the curious astronomer', 'Eli Navarro', 'Culture & science', 5, 9],
  ['The Shape of a Seed', 'From a tiny beginning to a garden', 'Ada Reed', 'Nature', 4, 8],
  ['Words We Carry', 'A first collection of poems for children', 'Samira Cole', 'Language', 6, 10],
  ['Hands in the Earth', 'A year of tending, planting and waiting', 'Theo Martin', 'Nature', 3, 7],
  ['Numbers in the Wild', 'Finding patterns on an ordinary walk', 'June Park', 'Culture & science', 4, 8],
  ['A Room of One’s Own', 'Making space for independent play', 'Leah Bennett', 'Practical life', 2, 6],
]

export const seedBooks: BookInput[] = rows.map(([title, subtitle, author, subject, ageMin, ageMax], i) => ({
  title,
  subtitle,
  author,
  subject,
  ageMin,
  ageMax,
  description: subtitle,
  coverUrl: null,
  coverAlt: `Cover of ${title}`,
  featured: i < 4,
  published: true,
}))
