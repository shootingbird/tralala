"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/product";

interface CategoryCarouselProps {
  categories: Category[];
}

export default function CategoryCarousel({
  categories,
}: CategoryCarouselProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    if (categories.length === 0) return;

    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [categories.length]);

  if (categories.length === 0) return null;

  return (
    <nav className="hidden md:block bg-white overflow-hidden relative z-[10] px-6">
      <div className="relative min-h-20 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${carouselIndex * 168}px)`, // 168px = w-40 (160px) + mx-1 (8px)
          }}
        >
          {/* Duplicate categories for infinite scroll effect */}
          {[...categories, ...categories, ...categories].map((cat, index) => (
            <div key={`${cat.id}-${index}`} className="flex-shrink-0 w-40 mx-1">
              <Link
                href={`/products?category=${cat.id}`}
                className="block px-4 py-3 rounded-md whitespace-nowrap hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <div className="relative w-32 h-24 mx-auto">
                  <Image
                    src={cat.image_url}
                    alt={cat.description}
                    fill
                    unoptimized
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="text-center mt-2 text-sm truncate">{cat?.name}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
