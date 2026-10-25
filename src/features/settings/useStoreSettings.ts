import { createContext, useContext } from 'react'
import type { AsyncState } from '../../lib/useAsync'
import type { StoreSettings } from '../../types/catalog'

export const StoreSettingsContext = createContext<AsyncState<StoreSettings> | null>(null)

export function useStoreSettings(): AsyncState<StoreSettings> {
  const value = useContext(StoreSettingsContext)
  if (!value) throw new Error('useStoreSettings must be used inside <StoreSettingsProvider>.')
  return value
}

/** Matches the database default for store_settings.low_stock_threshold. */
const DEFAULT_LOW_STOCK_THRESHOLD = 3

export function useLowStockThreshold(): number {
  const settings = useStoreSettings()
  return settings.status === 'success'
    ? settings.data.low_stock_threshold
    : DEFAULT_LOW_STOCK_THRESHOLD
}
