import Image from 'next/image';
import { CTAButton } from '@/components/ui/CTAButton';

export const CTASection = () => {
    return (
        <section className="relative w-full min-h-[600px] md:h-[500px] hidden lg:block">
            <Image
                src="/cta.png"
                alt="Luxury Chandelier"
                fill
                className="object-cover"
                priority
            />

            <div className="absolute inset-0 flex md:items-center">
                <div className="w-full md:w-auto md:ml-auto">
                    <div className="bg-[#D9D9D9] p-8 md:p-12 md:mx-12 py-[3.5rem] md:max-w-[400px]">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Get 5% Cash Back On 3 Items.
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Pick your favorites, add to cart, and enjoy an automatic 5% cash back at checkout turning your purchase into an unbeatable deal!
                        </p>
                        <CTAButton href="/products">
                            Shop Now
                        </CTAButton>
                    </div>
                </div>
            </div>
        </section>
    );
};