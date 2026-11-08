import { describe, expect, it } from 'vitest'

describe('OAuth production secret', () => {
  it('is present as a server-only 256-bit hex secret', () => {
    const secret = process.env.MIDNIGHT_OAUTH_SECRET || ''
    expect(secret).toMatch(/^[a-f0-9]{64}$/i)
    expect(secret).not.toContain('your_')
  })
})
