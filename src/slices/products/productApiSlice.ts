import {
  ProductsResponse,
  SingleProductResponse,
  CategoriesResponse,
  Category,
} from "@/types/product";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { setCategories } from "../categoriesSlice";

export interface ProductsQueryParams {
  has_discount?: boolean;
  has_images?: boolean;
  code?: string;
  q?: string; // Add search parameter
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  page?: number;
  per_page?: number;
  category?: string;
  subcat?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort_by?: string;
  categories?: string; // comma-separated for multiple
}

export const productApiSlice = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductsQueryParams>({
      query: (params = {}) => {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, String(value));
          }
        });
        return url.pathname + url.search;
      },
    }),
    getProduct: builder.query<SingleProductResponse, number>({
      query: (productId) => `/api/products/${productId}`,
    }),
    getCategories: builder.query<Category[], void>({
      query: () => "/api/categories",
      transformResponse: (response: CategoriesResponse) => {
        return response.categories.sort(
          (a, b) => b.subcategories.length - a.subcategories.length
        );
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCategories(data));
        } catch {
          // Ignore errors here, they will be handled by the component
        }
      },
    }),
    getExploreProducts: builder.query<
      ProductsResponse,
      { page: number; per_page: number }
    >({
      query: ({ page, per_page }) => ({
        url: "/api/products",
        params: { page, per_page, has_images: true },
      }),
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems) => {
        currentCache.products.push(...newItems.products);
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    getRelatedProducts: builder.query<
      ProductsResponse,
      { productId: number; category: string; limit?: number }
    >({
      query: ({ productId, category, limit = 4 }) => ({
        url: "/api/products",
        params: {
          category,
          per_page: limit,
          has_images: true,
        },
      }),
      transformResponse: (response: ProductsResponse, _, arg) => {
        // Filter out the current product from related products
        return {
          ...response,
          products: response.products.filter(
            (product) => product.productId !== arg.productId
          ),
        };
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetExploreProductsQuery,
  useGetRelatedProductsQuery,
} = productApiSlice;
