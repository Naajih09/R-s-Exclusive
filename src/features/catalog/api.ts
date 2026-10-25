import { getSupabase } from '../../lib/supabase'
import type {
  Category,
  Product,
  ProductImage,
  StoreSettings,
} from '../../types/catalog'
import { toPrefixQuery } from './search'

const PRODUCT_COLUMNS =
  'id, name, slug, description, price_ngn, stock_quantity, details, images:product_images(public_url, position)'

type ProductRow = Omit<Product, 'price_ngn' | 'category'> & {
  price_ngn: number | string
  category: Product['category'] | Product['category'][]
}

function toProduct(row: ProductRow): Product {
  const category = Array.isArray(row.category) ? row.category[0] : row.category
  return {
    ...row,
    price_ngn: Number(row.price_ngn),
    category: category ?? null,
    images: [...(row.images ?? [])].sort(
      (a: ProductImage, b: ProductImage) => a.position - b.position,
    ),
  }
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await getSupabase()
    .from('store_settings')
    .select(
      'store_name, whatsapp_number, phone, address, opening_hours, logo_url, low_stock_threshold',
    )
    .single()
  if (error) throw new Error(`Could not load store settings: ${error.message}`)
  return data
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from('categories')
    .select('id, name, slug, position')
    .order('position')
    .order('name')
  if (error) throw new Error(`Could not load categories: ${error.message}`)
  return data
}

export type ProductFilters = {
  categorySlug?: string
  search?: string
}

/** Lists published products (RLS hides the rest), newest first. */
export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  // An inner join lets us filter by category slug; otherwise keep
  // uncategorised products in the list.
  const categoryJoin = filters.categorySlug
    ? 'category:categories!inner(name, slug)'
    : 'category:categories(name, slug)'

  let query = getSupabase()
    .from('products')
    .select(`${PRODUCT_COLUMNS}, ${categoryJoin}`)
    .order('created_at', { ascending: false })
    .order('name')

  if (filters.categorySlug) {
    query = query.eq('categories.slug', filters.categorySlug)
  }

  const tsQuery = toPrefixQuery(filters.search ?? '')
  if (tsQuery) {
    query = query.textSearch('search_text', tsQuery, { config: 'simple' })
  }

  const { data, error } = await query
  if (error) throw new Error(`Could not load products: ${error.message}`)
  return (data as unknown as ProductRow[]).map(toProduct)
}

/** Returns a published product, or null when it does not exist or is hidden. */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from('products')
    .select(`${PRODUCT_COLUMNS}, category:categories(name, slug)`)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`Could not load product: ${error.message}`)
  return data ? toProduct(data as unknown as ProductRow) : null
}
