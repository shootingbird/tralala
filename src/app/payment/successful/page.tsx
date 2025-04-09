'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
 import { TopBanner } from '@/components/layout/TopBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
 import { ProductGrid } from '@/components/product/ProductGrid';
import { demoProducts } from '@/data/demo';

export default function PaymentSuccessfulPage() {
    const router = useRouter();

 

    return (
        <>
            <TopBanner theme="dark" />
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="bg-[#EDF0F8] py-[3rem] md:py-[10rem] rounded-xl px-[2rem] md:px-6">
                    <div className="max-w-xl mx-auto py-8 text-center">
                        <h1 className="text-3xl font-medium mb-5">Thank you for your order!</h1>
                        <p className="text-gray-600 text-sm mb-10">Your order #249700 was accepted and will be processed shortly.</p>

                        <Button
                            onClick={() => router.push('/')}
                            rounded={true}
                            className="max-w-[70%] mx-auto block rounded-full"
                        >
                            Continue shopping
                        </Button> 
                    </div>
                </div>

                <ProductGrid
                    title="Similar Items You Might Like"
                    products={demoProducts.slice(0, 4)}
                    isLoading={false}
                />
            </main>
            <Footer />
        </>
    );
}