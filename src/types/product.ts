export interface Variation {
  id: string;
  variation: string;
  price: number;
  quantity: number;
  // Add other variation fields as needed
}

export interface Product {
  category: string;
  category_id: string;
  computed_stock_status: string;
  computed_total_stock: number;
  created_at: string;
  description: string;
  discount_price: number | null;
  effective_price: number;
  highlights: string[];
  images: string[];
  image_urls?: string[]; // for single product
  is_variable_product: boolean;
  price: number;
  productId: number;
  product_code: string;
  rating: number;
  review_count: number;
  specifications: Record<string, unknown>;
  stock_quantity: number;
  stock_status: string;
  title: string;
  name?: string; // for single product
  total_sold: number;
  updated_at: string;
  variations: Variation[];
  whats_in_box: string[];
  sub_category?: string[];
}

export interface Pagination {
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  next_page: number | null;
  per_page: number;
  prev_page: null;
  total: number;
  total_pages: number;
}

export interface ProductsResponse {
  pagination: Pagination;
  products: Product[];
}

export interface SingleProductResponse {
  product: Product;
}

export interface Subcategory {
  description: string | null;
  id: string;
  name: string;
  slug: string;
}

export interface TopProduct {
  description: string;
  id: number;
  images: string[];
  name: string;
  price: number;
  rating: number;
  review_count: number;
  stock_quantity: number;
  total_sold: number;
}

export interface Category {
  description: string;
  id: string;
  image_url: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
  topProducts: TopProduct[];
}

export interface CategoriesResponse {
  categories: Category[];
}

// Normalized interfaces for product detail page
export interface NormalizedVariation {
  id?: string; // normalized id
  price: number;
  quantity: number;
  variation: string;
  variationQuantityInCart?: number;
}

export interface NormalizedProduct {
  productId: string;
  name: string;
  brand: string;
  title?: string;
  price: number;
  is_variable_product?: boolean;
  rating: number | 0;
  image: string;
  images: string[];
  image_urls: string[];
  isNew?: boolean;
  dateCreated: string;
  dateUpdated: string;
  stock: number;
  review_count?: number;
  category: string;
  totalSold: number;
  specifications?: Array<{ key: string; value: string }>;
  highlights?: string[];
  whats_in_box?: string[];
  description?: string;
  discount?: { amount: number; percentage: number };
  variations: NormalizedVariation[];
  stock_quantity?: number;
}
