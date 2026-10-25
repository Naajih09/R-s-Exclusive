import { getStockStatus } from '../../features/catalog/stock'

type Props = { quantity: number; lowThreshold: number }

export function StockBadge({ quantity, lowThreshold }: Props) {
  const status = getStockStatus(quantity, lowThreshold)
  if (status === 'out') {
    return (
      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
        Out of stock
      </span>
    )
  }
  if (status === 'low') {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        Only {quantity} left
      </span>
    )
  }
  return null
}
