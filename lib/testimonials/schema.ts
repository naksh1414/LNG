import { z } from 'zod'

export const testimonialSchema = z.object({
  quote: z.string().trim().min(1, 'Enter the quote.').max(400, 'Use 400 characters or fewer.'),
  name: z.string().trim().min(1, 'Enter a name.').max(80, 'Use 80 characters or fewer.'),
  role: z.string().trim().max(80, 'Use 80 characters or fewer.'),
  published: z.boolean(),
})
