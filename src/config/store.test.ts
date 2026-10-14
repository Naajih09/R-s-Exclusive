import { describe, expect, it } from 'vitest'
import { storeConfig } from './store'

describe('store configuration', () => {
  it('provides a sensible display name and keeps document placeholders visible', () => {
    expect(storeConfig.storeName).toBe('Your Store')
    expect(storeConfig.placeholders.storeName).toBe('[STORE NAME]')
    expect(storeConfig.placeholders.clientName).toBe('[CLIENT NAME]')
  })
})
