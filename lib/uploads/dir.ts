import path from 'node:path'

export const UPLOAD_DIR = (): string => process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
