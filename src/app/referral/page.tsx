'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { TopBanner } from '@/components/layout/TopBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
 
export default function ReferralPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('ref'); 

        if (code) {
            Cookies.set('referral_coupon', code, { expires: 30 });
            toast.success('Referral coupon has been saved successfully!');
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } else {
            router.push('/');
        }
    }, [searchParams, router]);

    return (
        <>
            <TopBanner theme="dark" />
            <Header />
            <div className="px-[2rem] py-[2rem]">
                <div className="">
                    <div className="container mx-auto px-[2rem] py-[2rem] bg-gradient-to-tr rounded-[1rem] from-[#E2DAEC] to-[#E4EEFD]">
                        <div className="flex p-[2rem] flex-col lg:flex-row items-start lg:items-center justify-center py-[5rem] gap-12">
                            <div className="space-y-6 px-[5rem] h-full">
                                <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Processing Your Referral</h1>
                                <p className="text-gray-600">
                                    We&rsquo;re saving your referral code and will<br />
                                    redirect you to our homepage shortly.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}