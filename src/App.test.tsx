import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { CartProvider } from './features/cart/CartProvider'
import * as api from './features/catalog/api'
import { StoreSettingsProvider } from './features/settings/StoreSettingsProvider'
import type { Product } from './types/catalog'

vi.mock('./features/catalog/api')

const hoodie: Product = {
  id: 'p1',
  name: 'Classic Black Hoodie',
  slug: 'classic-black-hoodie',
  description: 'Cotton blend hoodie.',
  price_ngn: 18500,
  stock_quantity: 12,
  details: { Size: ['M', 'L'], Color: 'Black' },
  category: { name: 'Clothing', slug: 'clothing' },
  images: [],
}

const rice: Product = {
  id: 'p2',
  name: 'Ofada Rice 5kg',
  slug: 'ofada-rice-5kg',
  description: null,
  price_ngn: 21000,
  stock_quantity: 0,
  details: { Weight: '5kg' },
  category: { name: 'Food', slug: 'food' },
  images: [],
}

function renderAt(path: string) {
  return render(
    <StoreSettingsProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </CartProvider>
    </StoreSettingsProvider>,
  )
}

beforeEach(() => {
  vi.mocked(api.fetchStoreSettings).mockResolvedValue({
    store_name: 'R-s Exclusive',
    whatsapp_number: '0803 123 4567',
    phone: null,
    address: 'Ikeja, Lagos',
    opening_hours: null,
    logo_url: null,
    low_stock_threshold: 3,
  })
  vi.mocked(api.fetchCategories).mockResolvedValue([
    { id: 'c1', name: 'Clothing', slug: 'clothing', position: 0 },
    { id: 'c2', name: 'Food', slug: 'food', position: 1 },
  ])
  vi.mocked(api.fetchProducts).mockResolvedValue([hoodie, rice])
  vi.mocked(api.fetchProductBySlug).mockImplementation(async (slug) =>
    [hoodie, rice].find((product) => product.slug === slug) ?? null,
  )
})

describe('catalog', () => {
  it('lists products with prices, stock state and store details', async () => {
    renderAt('/')

    expect(await screen.findByText('Classic Black Hoodie')).toBeInTheDocument()
    expect(screen.getByText('₦18,500')).toBeInTheDocument()
    expect(screen.getByText('Out of stock')).toBeInTheDocument()
    expect(await screen.findByText('Ikeja, Lagos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Food' })).toHaveAttribute('href', '/?category=food')
  })

  it('searches through the URL and keeps the category filter', async () => {
    const user = userEvent.setup()
    renderAt('/?category=clothing')
    await screen.findByText('Classic Black Hoodie')
    expect(api.fetchProducts).toHaveBeenLastCalledWith({ categorySlug: 'clothing', search: '' })

    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'hood')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(api.fetchProducts).toHaveBeenLastCalledWith({
      categorySlug: 'clothing',
      search: 'hood',
    })
  })

  it('shows an error when products cannot load', async () => {
    vi.mocked(api.fetchProducts).mockRejectedValue(new Error('Could not load products: offline'))
    renderAt('/')
    expect(await screen.findByRole('alert')).toHaveTextContent('offline')
  })
})

describe('product to WhatsApp order', () => {
  it('requires options, adds to cart and builds the WhatsApp order', async () => {
    const user = userEvent.setup()
    renderAt('/products/classic-black-hoodie')

    const addButton = await screen.findByRole('button', { name: 'Add to cart' })
    expect(addButton).toBeDisabled()
    expect(screen.getByText('Choose size first.')).toBeInTheDocument()
    expect(screen.getByText('Black')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'L' }))
    await user.clear(screen.getByLabelText('Quantity'))
    await user.type(screen.getByLabelText('Quantity'), '2')
    await user.click(addButton)

    expect(screen.getByRole('link', { name: 'Cart, 2 items' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'View cart' }))

    const row = screen.getByRole('listitem')
    expect(within(row).getByText('Size: L')).toBeInTheDocument()
    expect(within(row).getByText('₦37,000')).toBeInTheDocument()

    const order = await screen.findByRole('link', { name: 'Order on WhatsApp' })
    const url = new URL(order.getAttribute('href') ?? '')
    expect(url.pathname).toBe('/2348031234567')
    expect(url.searchParams.get('text')).toContain('1. Classic Black Hoodie (Size: L) x2 = ₦37,000')
  })

  it('does not allow ordering an out-of-stock product', async () => {
    renderAt('/products/ofada-rice-5kg')
    expect(await screen.findByRole('button', { name: 'Out of stock' })).toBeDisabled()
    expect(screen.queryByLabelText('Quantity')).not.toBeInTheDocument()
  })

  it('shows a friendly message for hidden or missing products', async () => {
    renderAt('/products/white-polo-shirt')
    expect(await screen.findByText(/This product is not available/)).toBeInTheDocument()
  })

  it('keeps the cart after a reload and lets the customer change quantities', async () => {
    const user = userEvent.setup()
    const first = renderAt('/products/classic-black-hoodie')
    await user.click(await screen.findByRole('radio', { name: 'M' }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    first.unmount()

    renderAt('/cart')
    expect(screen.getByLabelText('Quantity of Classic Black Hoodie')).toHaveTextContent('1')
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Classic Black Hoodie' }))
    expect(screen.getByLabelText('Quantity of Classic Black Hoodie')).toHaveTextContent('2')
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
  })
})
