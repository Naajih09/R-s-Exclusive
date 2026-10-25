import { Link } from 'react-router'
import { StockBadge } from '../../components/ui/StockBadge'
import { formatNaira } from '../../lib/format'
import type { Product } from '../../types/catalog'

type Props = { product: Product; lowThreshold: number }

export function ProductCard({ product, lowThreshold }: Props) {
  const image = product.images[0]

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square bg-slate-100">
        {image ? (
          <img
            src={image.public_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No photo yet
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category && (
          <p className="text-xs uppercase tracking-wide text-slate-500">{product.category.name}</p>
        )}
        <h2 className="font-medium group-hover:underline">{product.name}</h2>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="font-semibold">{formatNaira(product.price_ngn)}</span>
          <StockBadge quantity={product.stock_quantity} lowThreshold={lowThreshold} />
        </div>
      </div>
    </Link>
  )
}
