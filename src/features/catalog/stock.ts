export type StockStatus = 'out' | 'low' | 'in'

export function getStockStatus(quantity: number, lowThreshold: number): StockStatus {
  if (quantity <= 0) return 'out'
  if (quantity <= lowThreshold) return 'low'
  return 'in'
}
