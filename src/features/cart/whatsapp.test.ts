import { describe, expect, it } from 'vitest'
import { cartReducer, emptyCart } from './cart'
import { buildOrderMessage, buildWhatsAppUrl, toWhatsAppNumber } from './whatsapp'

describe('toWhatsAppNumber', () => {
  it('converts local and international Nigerian formats', () => {
    expect(toWhatsAppNumber('0803 123 4567')).toBe('2348031234567')
    expect(toWhatsAppNumber('+234 803 123 4567')).toBe('2348031234567')
    expect(toWhatsAppNumber('2348031234567')).toBe('2348031234567')
  })
})

describe('buildOrderMessage', () => {
  it('lists each item with options, quantity, line total and subtotal', () => {
    let cart = cartReducer(emptyCart, {
      type: 'add',
      quantity: 2,
      line: {
        productId: 'p1',
        slug: 'hoodie',
        name: 'Hoodie',
        unitPrice: 18500,
        imageUrl: null,
        options: { Size: 'M' },
        maxQuantity: 5,
      },
    })
    cart = cartReducer(cart, {
      type: 'add',
      quantity: 1,
      line: {
        productId: 'p2',
        slug: 'rice',
        name: 'Ofada Rice 5kg',
        unitPrice: 21000,
        imageUrl: null,
        options: {},
        maxQuantity: 5,
      },
    })

    expect(buildOrderMessage(cart, 'R-s Exclusive')).toBe(
      [
        'Hello R-s Exclusive, I would like to order:',
        '',
        '1. Hoodie (Size: M) x2 = ₦37,000',
        '2. Ofada Rice 5kg x1 = ₦21,000',
        '',
        'Subtotal: ₦58,000',
        '',
        'Please confirm availability and delivery details.',
      ].join('\n'),
    )
  })
})

describe('buildWhatsAppUrl', () => {
  it('builds a wa.me link with the message URL-encoded', () => {
    const url = new URL(buildWhatsAppUrl('0803 123 4567', 'Hi & thanks\n₦1'))
    expect(url.origin + url.pathname).toBe('https://wa.me/2348031234567')
    expect(url.searchParams.get('text')).toBe('Hi & thanks\n₦1')
  })
})
