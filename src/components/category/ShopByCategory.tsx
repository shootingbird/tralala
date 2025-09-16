import { CategoryCard } from "./CategoryCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  slug: string;
}

const ShopByCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedCategories = localStorage.getItem("categories");
    if (cachedCategories) {
      const parsedCategories = JSON.parse(cachedCategories);
      setCategories(parsedCategories);
      setIsLoading(false);
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          localStorage.setItem("categories", JSON.stringify(data.categories));
          setCategories(data.categories);
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

  return (
    <section className="py-2 md:py-4 ">
      <div className="container mx-auto px-3 md:px-4">
        <h2 className="text-lg font-semibold mb-3 ">Shop by Categories</h2>
        <div className="">
          <div className="md:hidden  overflow-hidden ">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={12}
              slidesPerView={4}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <SwiperSlide key={index}>
                      <div className="animate-pulse bg-gray-200 rounded-[2rem] w-[120px] h-[120px]"></div>
                      <div className="animate-pulse bg-gray-200 h-3 w-16 mx-auto mt-2 rounded"></div>
                    </SwiperSlide>
                  ))
                : categories.slice(0, 7).map((category, index) => (
                    <SwiperSlide key={index}>
                      <CategoryCard {...category} />
                    </SwiperSlide>
                  ))}
            </Swiper>
          </div>

          <div className="hidden md:grid grid-cols-4 lg:grid-cols-7 gap-4">
            {isLoading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="animate-pulse bg-gray-200 rounded-[2rem] w-[120px] h-[120px] mx-auto"></div>
                    <div className="animate-pulse bg-gray-200 h-3 w-16 mx-auto rounded"></div>
                  </div>
                ))
              : categories
                  .slice(0, 7)
                  .map((category, index) => (
                    <CategoryCard key={index} {...category} />
                  ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
