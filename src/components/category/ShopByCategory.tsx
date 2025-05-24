import { CategoryCard } from "./CategoryCard"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useState, useEffect } from 'react';

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
        const cachedCategories = localStorage.getItem('categories');
        if (cachedCategories) {
            const parsedCategories = JSON.parse(cachedCategories);
            setCategories(parsedCategories);
            setIsLoading(false);

        }

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
                const data = await response.json();
                if (Array.isArray(data.categories)) {
                    localStorage.setItem('categories', JSON.stringify(data.categories));
                    setCategories(data.categories);
                    setIsLoading(false);

                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching categories:', error.message);
                }
            }
        };

        fetchCategories();
    }, []);
    return (
        <section className="space-y-4 py-[1rem] md:py-[2rem]">
            <div className="container mx-auto px-4 lg:px-[5rem]">
                <h2 className="text-lg md:text-xl font-semibold text-center mb-12">Shop by Categories</h2>
                <div className="">
                    <div className="md:hidden">
                        <Swiper
                            modules={[Pagination]}
                            spaceBetween={24}
                            slidesPerView={2}
                            pagination={{
                                clickable: true,
                                dynamicBullets: true,
                            }} className="mySwiper pb-10">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="animate-pulse bg-gray-200 rounded-full h-[150px]"></div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                categories.slice(0, 12).map((category, index) => (
                                    <SwiperSlide key={index}>
                                        <CategoryCard {...category} />
                                    </SwiperSlide>
                                ))
                            )}
                        </Swiper>
                    </div>

                    <div className="hidden md:grid sm:grid-cols-4 lg:grid-cols-6 gap-10">
                        {isLoading ? (
                            Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="animate-pulse bg-gray-200 rounded-full h-[150px]"></div>
                            ))
                        ) : (
                            categories.slice(0, 12).map((category, index) => (
                                <CategoryCard key={index} {...category} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopByCategory;