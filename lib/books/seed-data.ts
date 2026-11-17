import type { BookInput } from './types'

// One series with one subject; each book is a class. Ages come from the cover ("For Age 6+"):
// 18 is the schema's upper limit and reads as "Ages 6+".
type Row = [label: string, file: string, classLevel: string, ageMin: number]

const rows: Row[] = [
  ['A', 'a', 'Nursery', 3],
  ['B', 'b', 'LKG', 4],
  ['C', 'c', 'UKG', 5],
  ['1', '1', 'Class 1', 6],
  ['2', '2', 'Class 2', 7],
  ['3', '3', 'Class 3', 8],
  ['4', '4', 'Class 4', 9],
  ['5', '5', 'Class 5', 10],
]

export const seedBooks: BookInput[] = rows.map(([label, file, classLevel, ageMin], i) => ({
  title: `Dreamscape Art and Craft ${label}`,
  subtitle: `Art and craft for ${classLevel}`,
  author: 'Learn N Grow',
  series: 'Dreamscape',
  subject: 'Art and craft',
  classLevel,
  ageMin,
  ageMax: 18,
  description: 'Colouring, drawing, activities, tear and paste, paper models, paper craft, origami and fun facts.',
  coverUrl: `/Books/dreamscape-${file}.jpg`,
  coverAlt: `Cover of Dreamscape Art and Craft ${label}`,
  featured: i < 4,
  published: true,
}))
