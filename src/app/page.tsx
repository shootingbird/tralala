"use client";
import { useEffect, useState } from "react";
import ShopByCategory from "@/components/category/ShopByCategory";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBanner } from "@/components/layout/TopBanner";
import { ProductGrid } from "@/components/product/ProductGrid";
import { InstallPWAPrompt } from "@/components/pwa/InstallPWAPrompt";
// import { DealOfMonth } from "@/components/sections/DealOfMonth";
import { Hero } from "@/components/sections/Hero";
import { WhyShopWithUs } from "@/components/sections/WhyShopWithUs";

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
  const [exploreProducts, setExploreProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [dealsResponse, newArrivalsResponse, exploreResponse] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/products?filter=top&max=20`
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/products?filter=new&max=20`
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/products?filter=explore&max=200`
            ),
          ]);

        const dealsData = await dealsResponse.json();
        const newArrivalsData = await newArrivalsResponse.json();
        const exploreData = await exploreResponse.json();

        console.log(dealsData);

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

        if (Array.isArray(exploreData.products)) {
          const mappedExplore = exploreData.products.map(mapProduct);
          localStorage.setItem(
            "exploreProducts",
            JSON.stringify(mappedExplore)
          );
          setExploreProducts(mappedExplore);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const cachedDeals = localStorage.getItem("deals");

    const cachedNewArrivals = localStorage.getItem("newArrivals");
    const cachedExplore = localStorage.getItem("exploreProducts");

    if (cachedDeals) setDeals(JSON.parse(cachedDeals));
    if (cachedNewArrivals) setNewArrivals(JSON.parse(cachedNewArrivals));
    if (cachedExplore) setExploreProducts(JSON.parse(cachedExplore));

    fetchProducts();
  }, []);
  console.log("Deals:", deals);
  return (
    <>
      <TopBanner theme={"dark"} />
      <Header />
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
      <ProductGrid
        title="Top Picks"
        subtitle=""
        viewAllLink="/products"
        products={deals}
        enablePagination={false}
        infiniteScroll={false}
        scrollonmobile={true}
      />

      <WhyShopWithUs />
      <ProductGrid
        title="Explore Products"
        subtitle=""
        viewAllLink="/products"
        products={exploreProducts}
        enablePagination={false}
        infiniteScroll={true}
      />

      <CTASection />
      <Footer />
      <InstallPWAPrompt />
    </>
  );
}
