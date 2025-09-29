// app/(somewhere)/page.tsx  (or where your Home component lives)
"use client";
import { useEffect, useState } from "react";
import ShopByCategory from "@/components/category/ShopByCategory";
import { CTASection } from "@/components/home/CTASection";
import { TopBanner } from "@/components/layout/TopBanner";
import { ProductGrid } from "@/components/product/ProductGrid";
import { InstallPWAPrompt } from "@/components/pwa/InstallPWAPrompt";
// import { DealOfMonth } from "@/components/sections/DealOfMonth";
import { Hero } from "@/components/sections/Hero";
import { WhyShopWithUs } from "@/components/sections/WhyShopWithUs";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import Header from "@/components/layout/Header";

interface Product {
  productId: string;
  title: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  images: string[];
  isNew?: boolean;
  discount?: {
    amount: number;
    percentage: number;
  };
  dateCreated: string;
  dateUpdated: string;
  categoryId: string;
  stock: number;
  totalSold: number;
  variations?: { price: number; quantity: number; variation: string }[];
}

export default function Home() {
  const [deals, setDeals] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  // exploreProducts removed from client-side fetch — ProductGrid will load it from the backend

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [dealsResponse, newArrivalsResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=1&per_page=20&filter=top&max=20`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=1&per_page=20&filter=new&max=20`
          ),
        ]);

        const dealsData = await dealsResponse.json();
        const newArrivalsData = await newArrivalsResponse.json();

        const mapProduct = (product: Product) => ({
          ...product,
          dateCreated: product.dateCreated || new Date().toISOString(),
          dateUpdated: product.dateUpdated || new Date().toISOString(),
          categoryId: product.categoryId || "",
          stock: product.stock || 0,
          totalSold: product.totalSold || 0,
        });

        if (Array.isArray(dealsData.products)) {
          const mappedDeals = dealsData.products.map(mapProduct);
          localStorage.setItem("deals", JSON.stringify(mappedDeals));
          setDeals(mappedDeals);
        }

        if (Array.isArray(newArrivalsData.products)) {
          const mappedNewArrivals = newArrivalsData.products.map(mapProduct);
          localStorage.setItem(
            "newArrivals",
            JSON.stringify(mappedNewArrivals)
          );
          setNewArrivals(mappedNewArrivals);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const cachedDeals = localStorage.getItem("deals");
    const cachedNewArrivals = localStorage.getItem("newArrivals");

    if (cachedDeals) setDeals(JSON.parse(cachedDeals));
    if (cachedNewArrivals) setNewArrivals(JSON.parse(cachedNewArrivals));

    fetchProducts();
  }, []);

  return (
    <>
      <TopBanner theme={"dark"} />
      <Header showSearch={true} />
      <Hero />
      <ShopByCategory />
      <ProductGrid
        title="New Arrivals"
        subtitle=""
        viewAllLink="/products/new"
        products={newArrivals}
        enableSales={false}
        enablePagination={false}
        infiniteScroll={false}
        scrollonmobile={true}
      />
      <div className="-mt-16 md:mt-0">
        <ProductGrid
          title="Top Picks"
          subtitle=""
          viewAllLink="/products"
          products={deals}
          enablePagination={false}
          infiniteScroll={false}
          scrollonmobile={true}
        />
      </div>

      <WhyShopWithUs />

      {/* Explore Products - now backend-driven infinite scroll */}
      <div className="-mt-16 md:mt-0">
        <ProductGrid
          title="Explore Products"
          subtitle=""
          viewAllLink="/products"
          products={[]} // no client-side full list
          enablePagination={false}
          infiniteScroll={true}
          apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/api/products`}
          perPage={24}
        />
      </div>

      <CTASection />
      {/* <Footer /> */}
      <InstallPWAPrompt />
      <ScrollToTopButton />
    </>
  );
}

// /api/products?q=&filter=newest&sort=price_desc&category=Phones&subcat=Android&min_price=50000&max_price=350000&rating_min=3&rating_max=5&in_stock=true&stock_status=in_stock&is_variable=true&tags=android,5g&tags_mode=any&ids=1,2,3&exclude_ids=10,11&has_discount=true&has_images=true&code=SKU-1001&created_after=2025-01-01&created_before=2025-12-31&updated_after=&updated_before=&per_page=10&page=2
