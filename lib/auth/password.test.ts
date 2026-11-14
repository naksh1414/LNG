// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { hashPassword, passwordPolicy, verifyPassword } from './password'

describe('password', () => {
  it('hashPassword then verifyPassword succeeds and a wrong password fails', async () => {
    const hash = await hashPassword('correct horse battery')
    expect(hash).toMatch(/^\$2[aby]\$12\$/)
    expect(await verifyPassword('correct horse battery', hash)).toBe(true)
    expect(await verifyPassword('correct horse batterz', hash)).toBe(false)
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false)
  })

  it('passwordPolicy rejects 9 characters', () => {
    expect(passwordPolicy('123456789')).toEqual(expect.any(String))
    expect(passwordPolicy('1234567890')).toBeNull()
    expect(passwordPolicy('x'.repeat(73))).toEqual(expect.any(String))
  })
})
