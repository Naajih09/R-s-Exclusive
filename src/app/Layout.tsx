import { Link, Outlet } from 'react-router'
import { storeConfig } from '../config/store'
import { cartItemCount } from '../features/cart/cart'
import { useCart } from '../features/cart/useCart'
import { useStoreSettings } from '../features/settings/useStoreSettings'

export function Layout() {
  const settings = useStoreSettings()
  const { cart } = useCart()
  const count = cartItemCount(cart)
  const store = settings.status === 'success' ? settings.data : null
  const storeName = store?.store_name ?? storeConfig.storeName

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            {store?.logo_url && (
              <img src={store.logo_url} alt="" className="h-8 w-8 rounded object-cover" />
            )}
            {storeName}
          </Link>
          <Link
            to="/cart"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
          >
            Cart ({count})
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl space-y-1 px-4 py-6 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{storeName}</p>
          {store?.address && <p>{store.address}</p>}
          {store?.opening_hours && <p>Open: {store.opening_hours}</p>}
          {store?.phone && (
            <p>
              Call: <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="underline">{store.phone}</a>
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
