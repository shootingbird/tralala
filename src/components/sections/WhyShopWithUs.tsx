import { CustomerSupportIcon } from '@/components/icons/ShopIcons';
import { RippleEffect } from '@/components/ui/RippleEffect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const features = [
    {
        icon: CustomerSupportIcon,
        title: 'Nationwide Delivery',
        description: 'Enjoy fast and reliable delivery to any location across the country'
    },
    {
        icon: CustomerSupportIcon,
        title: 'Secured Payment',
        description: 'Shop with confidence using our safe payment options.'
    },
    {
        icon: CustomerSupportIcon,
        title: 'Quality Assurance',
        description: 'Every product is carefully vetted to ensure top-notch quality.'
    },
    {
        icon: CustomerSupportIcon,
        title: 'Customer Support',
        description: 'Get assistance anytime with our dedicated customer service team.'
    }
];

export const WhyShopWithUs = () => {
    return (
        <section className="py-5 md:py-[4rem]">
            <div className="container mx-auto px-4">

                <h2 className="text-xl font-semibold text-center mb-8"> Why Shop With Us</h2>


                <div className="">
                    <div className="md:hidden">
                        <Swiper
                            modules={[Pagination]}
                            spaceBetween={10}
                            slidesPerView={2}
                            pagination={{
                                clickable: true,
                                dynamicBullets: true,
                            }}
                            className="mySwiper pb-10"
                        >
                            {features.map((feature, index) => (
                                <SwiperSlide key={index}>
                                    <RippleEffect
                                        key={index}
                                        className="min-h-[20rem] bg-[#F5F5F5] rounded-[1rem] p-6 text-center md:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.3)] transition-transform hover:scale-105"
                                    >
                                        <div className="flex mb-5">
                                            <div className="flex flex-col p-3 items-center justify-center rounded-lg bg-[#184193]">
                                                <feature.icon className="w-10 h-10 text-[#FFFFFF]" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-black text-start my-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-black/80 text-start text-sm">
                                            {feature.description}
                                        </p>
                                    </RippleEffect>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>


                    <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <RippleEffect
                                key={index}
                                className="bg-[#FAFAFA] rounded-[1rem] p-6 text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.3)] transition-transform hover:scale-105"
                            >
                                <div className="flex mb-5">
                                    <div className="flex flex-col p-3 items-center justify-center rounded-lg bg-[#184193]">
                                        <feature.icon className="w-10 h-10 text-[#FFFFFF]" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-black text-start my-2">
                                    {feature.title}
                                </h3>
                                <p className="text-black/80 text-start text-sm">
                                    {feature.description}
                                </p>
                            </RippleEffect>
                        ))}
                    </div>
                </div>


            </div>
        </section>
    );
};