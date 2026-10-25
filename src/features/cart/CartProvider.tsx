import { useEffect, useReducer, type ReactNode } from 'react'
import { cartReducer, parseStoredCart, type CartState } from './cart'
import { CartContext } from './useCart'

const STORAGE_KEY = 'store-cart:v1'

function loadCart(): CartState {
  try {
    return parseStoredCart(localStorage.getItem(STORAGE_KEY))
  } catch {
    return parseStoredCart(null)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // Storage can be full or disabled (private browsing); the cart still works in memory.
    }
  }, [cart])

  return <CartContext value={{ cart, dispatch }}>{children}</CartContext>
}
