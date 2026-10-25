import { describe, expect, it } from 'vitest'
import { formatNaira } from './format'

describe('formatNaira', () => {
  it('groups thousands and drops kobo for whole amounts', () => {
    expect(formatNaira(18500)).toBe('₦18,500')
    expect(formatNaira(0)).toBe('₦0')
    expect(formatNaira(1250000)).toBe('₦1,250,000')
  })

  it('shows two decimal places when there is kobo', () => {
    expect(formatNaira(99.5)).toBe('₦99.50')
  })
})
