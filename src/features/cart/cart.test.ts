import { describe, expect, it } from 'vitest'
import {
  cartItemCount,
  cartReducer,
  cartSubtotal,
  emptyCart,
  lineKey,
  parseStoredCart,
  type CartState,
} from './cart'

const hoodie = {
  productId: 'p1',
  slug: 'hoodie',
  name: 'Hoodie',
  unitPrice: 18500,
  imageUrl: null,
  options: { Size: 'M' },
  maxQuantity: 3,
}

function add(state: CartState, quantity: number, overrides: Partial<typeof hoodie> = {}) {
  return cartReducer(state, { type: 'add', quantity, line: { ...hoodie, ...overrides } })
}

describe('cartReducer', () => {
  it('adds a new line keyed by product and options', () => {
    const state = add(emptyCart, 1)
    expect(state.lines).toHaveLength(1)
    expect(state.lines[0].key).toBe(lineKey('p1', { Size: 'M' }))
  })

  it('merges the same product and options into one line', () => {
    const state = add(add(emptyCart, 1), 1)
    expect(state.lines).toHaveLength(1)
    expect(state.lines[0].quantity).toBe(2)
  })

  it('keeps different options as separate lines', () => {
    const state = add(add(emptyCart, 1), 1, { options: { Size: 'L' } })
    expect(state.lines).toHaveLength(2)
  })

  it('never exceeds available stock', () => {
    expect(add(emptyCart, 10).lines[0].quantity).toBe(3)
    expect(add(add(emptyCart, 2), 2).lines[0].quantity).toBe(3)
  })

  it('ignores adding an out-of-stock product', () => {
    expect(add(emptyCart, 1, { maxQuantity: 0 })).toBe(emptyCart)
  })

  it('updates quantity and removes the line at zero', () => {
    const state = add(emptyCart, 2)
    const key = state.lines[0].key
    expect(cartReducer(state, { type: 'setQuantity', key, quantity: 1 }).lines[0].quantity).toBe(1)
    expect(cartReducer(state, { type: 'setQuantity', key, quantity: 0 }).lines).toHaveLength(0)
  })

  it('removes a line and clears the cart', () => {
    const state = add(add(emptyCart, 1), 1, { productId: 'p2' })
    const removed = cartReducer(state, { type: 'remove', key: state.lines[0].key })
    expect(removed.lines.map((line) => line.productId)).toEqual(['p2'])
    expect(cartReducer(state, { type: 'clear' })).toEqual(emptyCart)
  })
})

describe('lineKey', () => {
  it('does not depend on option order', () => {
    expect(lineKey('p1', { Size: 'M', Color: 'Red' })).toBe(
      lineKey('p1', { Color: 'Red', Size: 'M' }),
    )
  })
})

describe('totals', () => {
  it('counts items and sums the subtotal', () => {
    const state = add(add(emptyCart, 2), 1, { productId: 'p2', unitPrice: 1000 })
    expect(cartItemCount(state)).toBe(3)
    expect(cartSubtotal(state)).toBe(38000)
  })
})

describe('parseStoredCart', () => {
  it('restores a valid saved cart', () => {
    const state = add(emptyCart, 2)
    expect(parseStoredCart(JSON.stringify(state))).toEqual(state)
  })

  it('falls back to an empty cart for missing or corrupt data', () => {
    expect(parseStoredCart(null)).toEqual(emptyCart)
    expect(parseStoredCart('not json')).toEqual(emptyCart)
    expect(parseStoredCart('{"lines": "nope"}')).toEqual(emptyCart)
  })

  it('drops malformed lines and keeps the good ones', () => {
    const good = add(emptyCart, 1).lines[0]
    const raw = JSON.stringify({ lines: [good, { name: 'broken' }, { ...good, quantity: 0 }] })
    expect(parseStoredCart(raw).lines).toEqual([good])
  })
})
