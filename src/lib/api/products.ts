import {
  ProductsResponse,
  SingleProductResponse,
  CategoriesResponse,
} from "@/types/product";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ProductsQueryParams {
  has_discount?: boolean;
  has_images?: boolean;
  code?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  page?: number;
  per_page?: number;
  category?: string;
  subcat?: string;
}

/**
 * @deprecated Use RTK Query hooks from productApiSlice instead
 */
export async function fetchProducts(
  params: ProductsQueryParams = {}
): Promise<ProductsResponse> {
  const url = new URL(`${API_BASE_URL}/api/products`);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * @deprecated Use RTK Query hooks from productApiSlice instead
 */
export async function fetchProduct(
  productId: number
): Promise<SingleProductResponse> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}

/**
 * @deprecated Use RTK Query hooks from productApiSlice instead
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}
