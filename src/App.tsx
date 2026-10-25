import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { Layout } from './app/Layout'
import { StatusMessage } from './components/ui/StatusMessage'
import { CartPage } from './features/cart/CartPage'
import { CartProvider } from './features/cart/CartProvider'
import { CatalogPage } from './features/catalog/CatalogPage'
import { ProductPage } from './features/catalog/ProductPage'
import { StoreSettingsProvider } from './features/settings/StoreSettingsProvider'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="products/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="*"
          element={
            <StatusMessage>
              Page not found.{' '}
              <Link to="/" className="font-medium underline">
                Go to the catalogue
              </Link>
            </StatusMessage>
          }
        />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <StoreSettingsProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </StoreSettingsProvider>
  )
}

export default App
