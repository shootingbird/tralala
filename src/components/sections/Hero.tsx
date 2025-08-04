"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  topProducts: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const slides = [
  {
    bgImage: "/hero.png",
    text: "Free Delivery for Purchase\nover NGN100,000",
  },
  {
    bgImage: "/hero2.png",
    text: "The NORDIC & SIMPLE LED CHANDELIER",
  },
];

export const Hero = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cachedCategories = localStorage.getItem("categories");

    if (cachedCategories) {
      setCategories(JSON.parse(cachedCategories));
      setIsLoading(false);
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          const sortedCategories = data.categories.sort(
            (
              a: { topProducts?: { length: number }[] },
              b: { topProducts?: { length: number }[] }
            ) => (b.topProducts?.length || 0) - (a.topProducts?.length || 0)
          );
          localStorage.setItem("categories", JSON.stringify(sortedCategories));
          setCategories(sortedCategories);
          setIsLoading(false);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching categories:", error.message);
        }
      }
    };

    fetchCategories();
  }, []);

  const topCategories = useMemo(() => categories.slice(0, 4), [categories]);

  return (
    <section className="relative h-[20vh] sm:h-[25vh] hidden  md:flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className="hidden lg:block w-auto px-12 bg-[#F8F3F2] py-4"
        aria-label="Top categories"
      >
        {isLoading ? (
          <div className="space-y-3 h-full flex flex-col justify-between animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 bg-gray-200 rounded" />
            ))}
          </div>
        ) : (
          <nav className="space-y-2.5 h-full flex flex-col justify-between">
            {topCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products/category/${category.id}`}
                className="text-black font-medium hover:text-[#184193] transition-colors text-[.9rem] py-1"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </aside>

      {/* Carousel */}
      <div className="relative w-full h-full overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={index}
              className={clsx(
                "absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out",
                {
                  "opacity-100 z-10": isActive,
                  "opacity-0 z-0": !isActive,
                }
              )}
              role="group"
              aria-hidden={!isActive}
              aria-roledescription="slide"
            >
              {index === 1 ? (
                <div className="flex w-full h-full relative">
                  <div className="space-y-4 absolute z-50 text-white px-8 py-4 h-full flex flex-col items-start justify-center">
                    <h1
                      className={clsx(
                        "text-xl lg:text-3xl font-bold whitespace-pre-line",
                        isActive && "animate-fadeInUp"
                      )}
                    >
                      {slide.text}
                    </h1>
                    <button
                      onClick={() => router.push("/products")}
                      className="group bg-white text-[#005EB6] px-6 py-2.5 rounded-md inline-flex items-center gap-2 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                    >
                      Shop Now
                      <ArrowRight
                        size={18}
                        className="transform transition-transform duration-300 group-hover:translate-x-2"
                      />
                    </button>
                  </div>
                  {/* Left side: blue with fade */}
                  <div className="w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#005EB6] z-0" />
                    <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-l from-transparent via-[#005EB6]/60 to-[#005EB6] z-10 pointer-events-none" />
                    <div className="relative z-20 h-full flex items-center px-8 py-6 text-white"></div>
                  </div>

                  {/* Right side: Image with LEFT FADE-IN */}
                  <div className="w-1/2 relative h-full">
                    <Image
                      src={slide.bgImage}
                      alt={`Slide ${index + 1}`}
                      width={10000}
                      height={100000}
                      className="object-cover h-full"
                      priority={false}
                    />
                    <div className="absolute -left-0.5 top-0 w-20 h-full bg-gradient-to-l from-transparent to-[#005EB6] z-10 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <>
                  <Image
                    src={slide.bgImage}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center px-8 py-4">
                    <div className="text-white space-y-4 max-w-xl">
                      <h1
                        className={clsx(
                          "text-xl lg:text-3xl font-bold whitespace-pre-line",
                          isActive && "animate-fadeInUp"
                        )}
                      >
                        {slide.text}
                      </h1>
                      <button
                        onClick={() => router.push("/products")}
                        className="group bg-[#184193] text-white px-6 py-2.5 rounded-md inline-flex items-center gap-2 hover:bg-[#0f398c] transition-all duration-300 transform hover:scale-105"
                      >
                        Shop Now
                        <ArrowRight
                          size={18}
                          className="transform transition-transform duration-300 group-hover:translate-x-2"
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
      `}</style>
    </section>
  );
};
