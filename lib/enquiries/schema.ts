import { z } from 'zod'

export const enquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(120),
  message: z.string().trim().min(1).max(2000),
  bookId: z.string().max(64).optional(),
  // Honeypot: real users never see or fill it. The route treats a filled value as a bot.
  website: z.string().max(500).optional(),
})

export type EnquiryBody = z.infer<typeof enquirySchema>
