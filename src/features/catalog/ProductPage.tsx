import { useCallback, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { StockBadge } from '../../components/ui/StockBadge'
import { formatNaira } from '../../lib/format'
import { useAsync } from '../../lib/useAsync'
import type { Product } from '../../types/catalog'
import type { CartOptions } from '../cart/cart'
import { useCart } from '../cart/useCart'
import { useLowStockThreshold } from '../settings/useStoreSettings'
import { fetchProductBySlug } from './api'

export function ProductPage() {
  const { slug = '' } = useParams()
  const load = useCallback(() => fetchProductBySlug(slug), [slug])
  const product = useAsync(load)

  if (product.status === 'loading') return <StatusMessage>Loading product…</StatusMessage>
  if (product.status === 'error') {
    return <StatusMessage tone="error">{product.error.message}</StatusMessage>
  }
  if (!product.data) {
    return (
      <StatusMessage>
        This product is not available.{' '}
        <Link to="/" className="font-medium underline">
          Back to the catalogue
        </Link>
      </StatusMessage>
    )
  }
  // Remount per product so photo, option and quantity state never leak between pages.
  return <ProductDetail key={product.data.id} product={product.data} />
}

function ProductDetail({ product }: { product: Product }) {
  const { dispatch } = useCart()
  const lowThreshold = useLowStockThreshold()
  const [imageIndex, setImageIndex] = useState(0)
  const [options, setOptions] = useState<CartOptions>({})
  // Keep the raw text so the customer can clear the box and retype;
  // it is clamped to 1..stock on blur and when adding to the cart.
  const [quantityText, setQuantityText] = useState('1')
  const [added, setAdded] = useState(false)
  const quantity = Math.min(
    Math.max(Math.floor(Number(quantityText)) || 1, 1),
    product.stock_quantity,
  )

  const choices = Object.entries(product.details).filter(
    (entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0,
  )
  const specs = Object.entries(product.details).filter(([, value]) => !Array.isArray(value))
  const missing = choices.filter(([name]) => !options[name]).map(([name]) => name)
  const inStock = product.stock_quantity > 0
  const image = product.images[imageIndex]

  function onAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (missing.length > 0 || !inStock) return
    dispatch({
      type: 'add',
      quantity,
      line: {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: product.price_ngn,
        imageUrl: product.images[0]?.public_url ?? null,
        options,
        maxQuantity: product.stock_quantity,
      },
    })
    setQuantityText(String(quantity))
    setAdded(true)
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-slate-600 hover:underline">
        ← All products
      </Link>
      <article className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
            {image ? (
              <img src={image.public_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No photo yet
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((thumb, index) => (
                <button
                  key={thumb.public_url}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={index === imageIndex}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    index === imageIndex ? 'border-slate-900' : 'border-transparent'
                  }`}
                >
                  <img src={thumb.public_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {product.category && (
            <Link
              to={`/?category=${encodeURIComponent(product.category.slug)}`}
              className="text-xs uppercase tracking-wide text-slate-500 hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <p className="text-xl font-semibold">{formatNaira(product.price_ngn)}</p>
            <StockBadge quantity={product.stock_quantity} lowThreshold={lowThreshold} />
          </div>
          {product.description && (
            <p className="whitespace-pre-line text-slate-700">{product.description}</p>
          )}

          {specs.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {specs.map(([name, value]) => (
                <div key={name} className="contents">
                  <dt className="text-slate-500">{name}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}

          <form onSubmit={onAdd} className="space-y-4">
            {choices.map(([name, values]) => (
              <fieldset key={name}>
                <legend className="mb-2 text-sm font-medium">{name}</legend>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => (
                    <label
                      key={value}
                      className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-slate-900 has-focus-visible:ring-offset-2"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={options[name] === value}
                        onChange={() => {
                          setOptions((current) => ({ ...current, [name]: value }))
                          setAdded(false)
                        }}
                        className="sr-only"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            {inStock && (
              <div className="flex items-center gap-3">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={product.stock_quantity}
                  value={quantityText}
                  onChange={(event) => {
                    setQuantityText(event.target.value)
                    setAdded(false)
                  }}
                  onBlur={() => setQuantityText(String(quantity))}
                  className="w-20 rounded-lg border border-slate-300 px-3 py-1.5"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!inStock || missing.length > 0}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {inStock ? 'Add to cart' : 'Out of stock'}
            </button>
            {inStock && missing.length > 0 && (
              <p className="text-sm text-slate-600">
                Choose {missing.join(' and ').toLowerCase()} first.
              </p>
            )}
            {added && (
              <p role="status" className="text-sm text-green-700">
                Added to cart.{' '}
                <Link to="/cart" className="font-medium underline">
                  View cart
                </Link>
              </p>
            )}
          </form>
        </div>
      </article>
    </div>
  )
}
