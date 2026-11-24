import { z } from 'zod'
import { LIMITS } from './limits'

export const enquirySchema = z.object({
  name: z.string().trim().min(LIMITS.name.min).max(LIMITS.name.max),
  contact: z.string().trim().min(LIMITS.contact.min).max(LIMITS.contact.max),
  message: z.string().trim().min(LIMITS.message.min).max(LIMITS.message.max),
  bookId: z.string().max(64).optional(),
  // Honeypot: real users never see or fill it. The route treats a filled value as a bot.
  website: z.string().max(500).optional(),
})

export type EnquiryBody = z.infer<typeof enquirySchema>
