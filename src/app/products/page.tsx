'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { TopBanner } from '@/components/layout/TopBanner';
import { Header } from '@/components/layout/Header';

type FilterValue = string[] | number[] | { min?: number; max?: number };

interface FilterOption {
    id: string;
    label: string;
    type: 'checkbox' | 'radio' | 'range' | 'rating';
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

export default function ProductsPage() {
    return (
        <>
            <TopBanner theme={'dark'} />
            <Header />
            <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>}>
                <ProductList />
            </Suspense>
        </>
    );
}

function ProductList() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [productFilters, setProductFilters] = useState<FilterOption[]>([]);
    const searchQuery = searchParams.get('q') || '';

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products${searchQuery ? `?q=${searchQuery}` : ''}`);
            const data = await response.json();
            const products = data.products || [];
            setProducts(products);

            const validProducts = products.filter((p: Product) => p && p.rating != null);
            const prices = validProducts.map((p: Product) => p.price);
            const ratingsSet = new Set<number>(validProducts.map((p: Product) => Number(p.rating) ?? 0));
            const ratings = Array.from(ratingsSet).filter((rating): rating is number => !isNaN(rating)).sort((a: number, b: number) => b - a);

            setProductFilters(prev => prev.map(filter => {
                if (filter.id === 'price') {
                    return {
                        ...filter,
                        range: {
                            min: Math.min(...prices),
                            max: Math.max(...prices)
                        }
                    };
                }
                if (filter.id === 'rating' && ratings.length > 0) {
                    return {
                        ...filter,
                        options: ratings.map(rating => ({
                            value: rating.toString(),
                            label: `${rating}★ & above`,
                            amount: validProducts.filter((p: Product) => p.rating >= rating).length
                        }))
                    };
                }
                return filter;
            }));
            setIsLoading(false);

        } catch (error) {
            console.error('Error fetching products:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const handleFilterChange = async (filters: Record<string, FilterValue>) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const filteredProducts = products.filter(product => {
                console.log('Filters:', filters);
                console.log('Product:', product);
                return true;
            });

            setProducts(filteredProducts);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProductGrid
            title="All Products"
            subtitle={searchQuery && `Search results for "${searchQuery}"`}
            products={products}
            filters={productFilters as import('@/components/product/ProductFilter').FilterOption[]}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
            maxRecord={12}
        />
    );
}