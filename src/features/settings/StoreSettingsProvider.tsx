import type { ReactNode } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchStoreSettings } from '../catalog/api'
import { StoreSettingsContext } from './useStoreSettings'

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useAsync(fetchStoreSettings)
  return <StoreSettingsContext value={settings}>{children}</StoreSettingsContext>
}
