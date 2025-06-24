import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
    id: string
    name: string
    slug: string
    description: string
    image_url: string
    topProducts: {
        id: string
        name: string
        slug: string
    }[]
}

export const Hero = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cachedCategories = localStorage.getItem("categories")
        if (cachedCategories) {
            const parsedCategories = JSON.parse(cachedCategories)
            setCategories(parsedCategories)
            setIsLoading(false)
        }

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
                const data = await response.json()
                if (Array.isArray(data.categories)) {
                    const sortedCategories = data.categories.sort((a: { topProducts?: { length: number }[] }, b: { topProducts?: { length: number }[] }) =>
                        (b.topProducts?.length || 0) - (a.topProducts?.length || 0)
                    )
                    localStorage.setItem("categories", JSON.stringify(sortedCategories))
                    setCategories(sortedCategories)
                    setIsLoading(false)
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Error fetching categories:", error.message)
                }
            }
        }

        fetchCategories()
    }, [])

    return (
        <section className="relative">
            <div className="absolute inset-0">
                <Image
                    src="/hero.png"
                    alt="Hero background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="relative flex min-h-[200px]">
                <div className="w-auto px-[3rem] bg-[#F8F3F2] p-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-5 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2.5  h-full flex flex-col justify-between">
                            {categories.slice(0, 4).map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/products/category/${category.id}`}
                                    className="block textblack font-medium hover:text-[#184193] transition-colors text-[.9rem] py-1"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center px-8 py-8">
                    <div className="text-left">
                        <h1 className="text-3xl font-bold text-white mb-4">
                            Free Delivery for Purchase
                            <br />
                            over NGN100,000
                        </h1>
                        <button
                            onClick={() => router.push('/products')}
                            className="bg-[#184193] text-white px-6 py-2.5 rounded-md inline-flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm"
                        >
                            Shop Now
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};