export type Category = {
  id: string
  name: string
  slug: string
  position: number
}

export type ProductImage = {
  public_url: string
  position: number
}

/**
 * Free-form product attributes stored in `products.details`.
 * Arrays are choices the customer must pick (for example sizes);
 * single values are shown as specifications.
 */
export type ProductDetails = Record<string, string | number | string[]>

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price_ngn: number
  stock_quantity: number
  details: ProductDetails
  category: Pick<Category, 'name' | 'slug'> | null
  images: ProductImage[]
}

export type StoreSettings = {
  store_name: string
  whatsapp_number: string
  phone: string | null
  address: string | null
  opening_hours: string | null
  logo_url: string | null
  low_stock_threshold: number
}
