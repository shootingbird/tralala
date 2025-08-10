"use client";

import {
  CustomerSupportIcon,
  SecurePaymentIcon,
  WorldwideIcon,
} from "@/components/icons/ShopIcons";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: WorldwideIcon,
    title: "Nationwide Delivery",
    description:
      "Enjoy fast and reliable delivery to any location across the country.",
  },
  {
    icon: SecurePaymentIcon,
    title: "Secured Payment",
    description: "Shop with confidence using our safe payment options.",
  },
  {
    icon: CustomerSupportIcon,
    title: "Quality Assurance",
    description:
      "Every product is carefully vetted to ensure top-notch quality.",
  },
  {
    icon: CustomerSupportIcon,
    title: "Customer Support",
    description:
      "Get assistance anytime with our dedicated customer service team.",
  },
];

const WhyShopWithUs = () => {
  return (
    <section className="block md:hidden">
      <Header />

      <div className="container mx-auto px-4 py-4">
        <h2 className="text-xl font-semibold mb-4">Why Shop With Us</h2>
        <p className="text-gray-600 mb-6">
          At Steadfast International, we are committed to excellence. Here’s
          what sets us apart and why you can shop with confidence.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#FCF9F9] h-[200px] rounded-[1rem] p-5 text-center md:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 grid justify-between flex-col"
            >
              <div className="flex flex-col">
                <div className="flex mb-2">
                  <feature.icon className="w-10 h-10 text-[#FFFFFF]" />
                </div>
                <h3 className="text-[1rem] md:text-lg font-bold text-black text-start my-2 whitespace-pre-line">
                  {feature.title.split(" ").join("\n")}
                </h3>
              </div>
              <p className="text-black  text-start text-xs md:text-sm flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default WhyShopWithUs;
