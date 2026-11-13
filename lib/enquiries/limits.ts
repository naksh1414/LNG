// Shared by the zod schema and the client form (kept free of zod so the client bundle stays small).
export const LIMITS = {
  name: { min: 1, max: 100 },
  contact: { min: 3, max: 120 },
  message: { min: 1, max: 2000 },
} as const
