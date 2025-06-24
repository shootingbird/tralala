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
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-8">Shop by Categories</h2>
                <div className="">
                    <div className="md:hidden">
                        <Swiper
                            modules={[Pagination]}
                            spaceBetween={16}
                            slidesPerView={2.2}
                            pagination={{
                                clickable: true,
                            }}
                            className="pb-10">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="animate-pulse bg-gray-200 rounded-lg aspect-square"></div>
                                        <div className="animate-pulse bg-gray-200 h-4 w-20 mx-auto mt-3 rounded"></div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                categories.slice(0, 7).map((category, index) => (
                                    <SwiperSlide key={index}>
                                        <CategoryCard {...category} />
                                    </SwiperSlide>
                                ))
                            )}
                        </Swiper>
                    </div>

                    <div className="hidden md:grid grid-cols-3 lg:grid-cols-7 gap-6">
                        {isLoading ? (
                            Array.from({ length: 7 }).map((_, index) => (
                                <div key={index} className="space-y-3">
                                    <div className="animate-pulse bg-gray-200 rounded-lg aspect-square"></div>
                                    <div className="animate-pulse bg-gray-200 h-4 w-20 mx-auto rounded"></div>
                                </div>
                            ))
                        ) : (
                            categories.slice(0, 7).map((category, index) => (
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