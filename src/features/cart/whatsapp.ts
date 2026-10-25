import { formatNaira } from '../../lib/format'
import { cartSubtotal, type CartState } from './cart'

/**
 * Converts a Nigerian phone number to the international digits wa.me expects:
 * "0803 123 4567" and "+234 803 123 4567" both become "2348031234567".
 */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 11) return `234${digits.slice(1)}`
  return digits
}

export function buildOrderMessage(cart: CartState, storeName: string): string {
  const items = cart.lines.map((line, index) => {
    const options = Object.entries(line.options)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ')
    const label = options ? `${line.name} (${options})` : line.name
    return `${index + 1}. ${label} x${line.quantity} = ${formatNaira(line.unitPrice * line.quantity)}`
  })

  return [
    `Hello ${storeName}, I would like to order:`,
    '',
    ...items,
    '',
    `Subtotal: ${formatNaira(cartSubtotal(cart))}`,
    '',
    'Please confirm availability and delivery details.',
  ].join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`
}
