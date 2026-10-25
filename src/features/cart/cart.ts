export type CartOptions = Record<string, string>

export type CartLine = {
  /** Product id plus chosen options, so "Hoodie / M" and "Hoodie / L" are separate lines. */
  key: string
  productId: string
  slug: string
  name: string
  unitPrice: number
  imageUrl: string | null
  options: CartOptions
  quantity: number
  /** Stock available when the item was added; quantities are capped to it. */
  maxQuantity: number
}

export type CartState = { lines: CartLine[] }

export type CartAction =
  | { type: 'add'; line: Omit<CartLine, 'key' | 'quantity'>; quantity: number }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }

export const emptyCart: CartState = { lines: [] }

export function lineKey(productId: string, options: CartOptions): string {
  const parts = Object.keys(options)
    .sort()
    .map((name) => `${name}=${options[name]}`)
  return [productId, ...parts].join('|')
}

function clamp(quantity: number, max: number): number {
  return Math.max(0, Math.min(Math.floor(quantity), max))
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.line.productId, action.line.options)
      const existing = state.lines.find((line) => line.key === key)
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.key === key
              ? {
                  ...line,
                  ...action.line,
                  quantity: clamp(line.quantity + action.quantity, action.line.maxQuantity),
                }
              : line,
          ),
        }
      }
      const quantity = clamp(action.quantity, action.line.maxQuantity)
      if (quantity === 0) return state
      return { lines: [...state.lines, { ...action.line, key, quantity }] }
    }
    case 'setQuantity': {
      return {
        lines: state.lines
          .map((line) =>
            line.key === action.key
              ? { ...line, quantity: clamp(action.quantity, line.maxQuantity) }
              : line,
          )
          .filter((line) => line.quantity > 0),
      }
    }
    case 'remove':
      return { lines: state.lines.filter((line) => line.key !== action.key) }
    case 'clear':
      return emptyCart
  }
}

export function cartItemCount(state: CartState): number {
  return state.lines.reduce((total, line) => total + line.quantity, 0)
}

export function cartSubtotal(state: CartState): number {
  return state.lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0)
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false
  const line = value as Record<string, unknown>
  return (
    typeof line.key === 'string' &&
    typeof line.productId === 'string' &&
    typeof line.slug === 'string' &&
    typeof line.name === 'string' &&
    typeof line.unitPrice === 'number' &&
    (typeof line.imageUrl === 'string' || line.imageUrl === null) &&
    typeof line.options === 'object' &&
    line.options !== null &&
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    typeof line.maxQuantity === 'number'
  )
}

/** Parses a saved cart, dropping anything malformed instead of crashing. */
export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return emptyCart
  try {
    const parsed: unknown = JSON.parse(raw)
    const lines = (parsed as { lines?: unknown }).lines
    return Array.isArray(lines) ? { lines: lines.filter(isCartLine) } : emptyCart
  } catch {
    return emptyCart
  }
}
