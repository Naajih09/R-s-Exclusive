import { useCallback, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { useAsync } from '../../lib/useAsync'
import { useLowStockThreshold } from '../settings/useStoreSettings'
import { fetchCategories, fetchProducts } from './api'
import { ProductCard } from './ProductCard'

function chipClass(active: boolean): string {
  return active
    ? 'rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white'
    : 'rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-700 hover:border-slate-500'
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categorySlug = searchParams.get('category') ?? ''
  const search = searchParams.get('q') ?? ''
  const [draft, setDraft] = useState(search)
  const [syncedSearch, setSyncedSearch] = useState(search)
  const lowThreshold = useLowStockThreshold()

  // Keep the box in step when the URL changes (back button, category links).
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    setDraft(search)
  }

  const categories = useAsync(fetchCategories)
  const loadProducts = useCallback(
    () => fetchProducts({ categorySlug: categorySlug || undefined, search }),
    [categorySlug, search],
  )
  const products = useAsync(loadProducts)

  function hrefFor(slug: string): string {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (search) params.set('q', search)
    const query = params.toString()
    return query ? `/?${query}` : '/'
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    const value = draft.trim()
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next)
  }

  return (
    <div className="space-y-6">
      <form role="search" onSubmit={onSearch} className="flex gap-2">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Search products"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-slate-900 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          Search
        </button>
      </form>

      {categories.status === 'success' && categories.data.length > 0 && (
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          <Link to={hrefFor('')} className={chipClass(!categorySlug)}>
            All
          </Link>
          {categories.data.map((category) => (
            <Link
              key={category.id}
              to={hrefFor(category.slug)}
              className={chipClass(category.slug === categorySlug)}
              aria-current={category.slug === categorySlug ? 'page' : undefined}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}

      {products.status === 'loading' && <StatusMessage>Loading products…</StatusMessage>}
      {products.status === 'error' && (
        <StatusMessage tone="error">{products.error.message}</StatusMessage>
      )}
      {products.status === 'success' && products.data.length === 0 && (
        <StatusMessage>
          {search ? `No products match "${search}".` : 'No products here yet.'}
        </StatusMessage>
      )}
      {products.status === 'success' && products.data.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.data.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} lowThreshold={lowThreshold} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
