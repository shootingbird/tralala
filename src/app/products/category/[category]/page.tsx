"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { useParams } from "next/navigation";
import { NoProducts } from "@/components/ui/NoProducts";

type FilterValue = string[] | number[] | { min?: number; max?: number };

interface FilterOption {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range" | "rating";
  options?: Array<{ value: string; label: string; amount?: number }>;
  range?: { min: number; max: number };
}

interface Product {
  productId: string;
  title: string;
  brand: string;
  price: number;
  rating: number | 0;
  image: string;
  images: string[];
  category: string;
  isNew?: boolean;
  dateCreated: string;
  dateUpdated: string;
  categoryId: string;
  stock: number;
  totalSold: number;
  discount?: {
    amount: number;
    percentage: number;
  };
}
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}
export default function ProductsPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productFilters, setProductFilters] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  useEffect(() => {
    const cachedCategories = localStorage.getItem("categories");
    if (cachedCategories) {
      const parsedCategories = JSON.parse(cachedCategories);
      setCategories(parsedCategories);
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories&max=20`
        );
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          localStorage.setItem("categories", JSON.stringify(data.categories));
          setCategories(data.categories);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching categories:", error.message);
        }
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!products || products.length === 0) return;

    const prices = products.map((p) => p.price).filter(Boolean);
    const validRatings = products
      .map((p) => p.rating)
      .filter((rating): rating is number => rating !== null && !isNaN(rating));
    const ratingsSet = new Set<number>(validRatings);
    const ratings = Array.from(ratingsSet).sort((a, b) => b - a);

    const dynamicFilters: FilterOption[] = [
      {
        id: "category",
        label: "Category",
        type: "checkbox",
        options: categories.map((category) => ({
          value: category.id,
          label: category.name,
          amount: products.filter((p) => p.categoryId === category.id).length,
        })),
      },
      {
        id: "popularity",
        label: "Most Popular",
        type: "radio",
        options: [
          {
            value: "most-popular",
            label: "Most Popular",
            amount: products.filter(
              (p) => p.rating >= 4 && p.totalSold / p.stock >= 0.7
            ).length,
          },
          {
            value: "least-popular",
            label: "Least Popular",
            amount: products.filter(
              (p) => p.rating < 4 || p.totalSold / p.stock < 0.3
            ).length,
          },
          {
            value: "newest",
            label: "Newest",
            amount: products.filter((p) => {
              const createDate = new Date(p.dateCreated);
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              return createDate > threeMonthsAgo;
            }).length,
          },
          {
            value: "oldest",
            label: "Oldest",
            amount: products.filter((p) => {
              const createDate = new Date(p.dateCreated);
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              return createDate <= sixMonthsAgo;
            }).length,
          },
          {
            value: "highest-rated",
            label: "Highest Rated",
            amount: products.filter((p) => p.rating >= 4).length,
          },
        ],
      },
      {
        id: "price",
        label: "Price Range",
        type: "range",
        range: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
      },
      {
        id: "rating",
        label: "Rating",
        type: "rating",
        options:
          ratings.length > 0
            ? ratings.map((rating: number) => ({
                value: rating.toString(),
                label: `${rating}★ & above`,
                amount: products.filter((p) => p.rating >= rating).length,
              }))
            : [],
      },
    ];

    setProductFilters(dynamicFilters);
  }, [products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/category/${categorySlug}`
      );
      const data = await response.json();
      const cateogry_data = data.category;
      const products = data.products || [];

      setProducts(products);
      setCategoryData(cateogry_data);

      const validProducts = products.filter(
        (p: Product) => p && p.rating != null
      );
      const prices = validProducts.map((p: Product) => p.price);
      const ratingsSet = new Set<number>(
        validProducts.map((p: Product) => Number(p.rating) ?? 0)
      );
      const ratings = Array.from(ratingsSet)
        .filter((rating): rating is number => !isNaN(rating))
        .sort((a: number, b: number) => b - a);

      setProductFilters((prev) =>
        prev.map((filter) => {
          if (filter.id === "price") {
            return {
              ...filter,
              range: {
                min: Math.min(...prices),
                max: Math.max(...prices),
              },
            };
          }
          if (filter.id === "rating" && ratings.length > 0) {
            return {
              ...filter,
              options: ratings.map((rating) => ({
                value: rating.toString(),
                label: `${rating}★ & above`,
                amount: validProducts.filter((p: Product) => p.rating >= rating)
                  .length,
              })),
            };
          }
          return filter;
        })
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilterChange = async (filters: Record<string, FilterValue>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filteredProducts = products.filter((product) => {
      console.log("Filters:", filters);
      console.log("Product:", product);
      return true;
    });

    setProducts(filteredProducts);
  };

  return (
    <>
      <TopBanner theme={"dark"} />
      <Header />
      <br />

      <ProductGrid
        title={
          categories.find((cat) => cat.id == categorySlug)?.name || "Category"
        }
        subtitle={
          categories.find((cat) => cat.id == categorySlug)?.description ||
          "Category"
        }
        products={products}
        filters={
          productFilters as import("@/components/product/ProductFilter").FilterOption[]
        }
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        maxRecord={20}
        emptyState={<NoProducts />}
        enablePagination={false}
        infiniteScroll={true}
      />
    </>
  );
}
