import { describe, expect, it } from 'vitest'
import { toPrefixQuery } from './search'
import { getStockStatus } from './stock'

describe('toPrefixQuery', () => {
  it('matches every word as a prefix', () => {
    expect(toPrefixQuery('Ank Dre')).toBe('ank:* & dre:*')
  })

  it('returns null when there is nothing to search for', () => {
    expect(toPrefixQuery('')).toBeNull()
    expect(toPrefixQuery('   !!  ')).toBeNull()
  })

  it('strips tsquery operators so input cannot change the query', () => {
    expect(toPrefixQuery("rice' | !(x) & <-> :*")).toBe('rice:* & x:*')
  })

  it('keeps accented letters and numbers', () => {
    expect(toPrefixQuery('Café 600W')).toBe('café:* & 600w:*')
  })
})

describe('getStockStatus', () => {
  it('reports out, low and in stock using the threshold', () => {
    expect(getStockStatus(0, 3)).toBe('out')
    expect(getStockStatus(3, 3)).toBe('low')
    expect(getStockStatus(4, 3)).toBe('in')
  })
})
