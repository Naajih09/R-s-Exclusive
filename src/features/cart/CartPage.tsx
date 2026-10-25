import { Link } from 'react-router'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { formatNaira } from '../../lib/format'
import { useStoreSettings } from '../settings/useStoreSettings'
import { cartSubtotal, type CartLine } from './cart'
import { useCart } from './useCart'
import { buildOrderMessage, buildWhatsAppUrl } from './whatsapp'

export function CartPage() {
  const { cart, dispatch } = useCart()
  const settings = useStoreSettings()

  if (cart.lines.length === 0) {
    return (
      <StatusMessage>
        Your cart is empty.{' '}
        <Link to="/" className="font-medium underline">
          Browse products
        </Link>
      </StatusMessage>
    )
  }

  const store = settings.status === 'success' ? settings.data : null
  const orderUrl = store
    ? buildWhatsAppUrl(store.whatsapp_number, buildOrderMessage(cart, store.store_name))
    : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>

      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {cart.lines.map((line) => (
          <CartRow
            key={line.key}
            line={line}
            onQuantity={(quantity) => dispatch({ type: 'setQuantity', key: line.key, quantity })}
            onRemove={() => dispatch({ type: 'remove', key: line.key })}
          />
        ))}
      </ul>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Subtotal</span>
          <span>{formatNaira(cartSubtotal(cart))}</span>
        </div>
        <p className="text-sm text-slate-600">
          Delivery and final availability are confirmed by the store on WhatsApp.
        </p>
        {orderUrl ? (
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-green-600 px-4 py-3 text-center font-medium text-white hover:bg-green-700"
          >
            Order on WhatsApp
          </a>
        ) : settings.status === 'error' ? (
          <StatusMessage tone="error">
            Ordering is unavailable right now. {settings.error.message}
          </StatusMessage>
        ) : (
          <p className="text-center text-sm text-slate-500">Preparing checkout…</p>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: 'clear' })}
          className="w-full text-sm text-slate-600 underline hover:text-slate-900"
        >
          Empty cart
        </button>
      </div>
    </div>
  )
}

type RowProps = {
  line: CartLine
  onQuantity: (quantity: number) => void
  onRemove: () => void
}

function CartRow({ line, onQuantity, onRemove }: RowProps) {
  const options = Object.entries(line.options)
    .map(([name, value]) => `${name}: ${value}`)
    .join(', ')

  return (
    <li className="flex gap-3 p-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {line.imageUrl && (
          <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <Link to={`/products/${line.slug}`} className="font-medium hover:underline">
          {line.name}
        </Link>
        {options && <p className="text-sm text-slate-600">{options}</p>}
        <p className="text-sm">{formatNaira(line.unitPrice)} each</p>
        <div className="mt-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuantity(line.quantity - 1)}
            aria-label={`Decrease quantity of ${line.name}`}
            className="h-8 w-8 rounded-full border border-slate-300 hover:border-slate-500"
          >
            −
          </button>
          <span aria-label={`Quantity of ${line.name}`} className="w-6 text-center">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantity(line.quantity + 1)}
            disabled={line.quantity >= line.maxQuantity}
            aria-label={`Increase quantity of ${line.name}`}
            className="h-8 w-8 rounded-full border border-slate-300 hover:border-slate-500 disabled:opacity-40"
          >
            +
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-sm text-slate-600 underline hover:text-slate-900"
          >
            Remove
          </button>
        </div>
      </div>
      <p className="font-semibold">{formatNaira(line.unitPrice * line.quantity)}</p>
    </li>
  )
}
