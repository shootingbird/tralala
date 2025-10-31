import Image from "next/image";
import React from "react";
// Import shadcn/ui Card component (adjust path if your project uses a different location)
import { Card, CardContent } from "@/components/ui/card";

// Banner component — recreated to match the screenshot.
const Banner: React.FC = () => {
  return (
    <section
      role="region"
      aria-label="Promotional banner: Free delivery"
      className="bg-[#F8F3F2] px-4 py-4 lg:py-8 hidden md:block"
    >
      <div className="mx-auto max-w-6xl">
        {/* Container that centers content and changes layout at md */}
        <div className="flex  items-center gap-6 flex-row md:items-center md:justify-between">
          {/* Left: Image card */}
          <Card
            aria-label="Decorative bedroom photo"
            className="w-full flex-1 shrink-0  p-0 shadow-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-300 md:max-w-[520px]"
          >
            <CardContent className="p-0">
              <div
                className="relative aspect-[10/7] lg:h-72 w-full overflow-hiddentransition-transform duration-200 ease-in-out focus:outline-none"
                tabIndex={0}
                aria-hidden={false}
                role="img"
              >
                <Image
                  src="/banner.png"
                  alt="Stylish bedroom interior with chandelier and window"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  className="transform transition-transform duration-300 hover:scale-105 focus:scale-105"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          {/* Right: Text block */}
          <div className="flex-1 w-full flex justify-start  lg:pl-8">
            <h2
              className="mx-auto max-w-2xl  text-center font-sans  text-lg md:text-2xl lg:text-6xl font-normal leading-tight text-[#111827] md:mx-0"
              style={{ lineHeight: 1.02 }}
            >
              <span className="block">Free Delivery for</span>
              <span className="block">Orders Above</span>
              <span className="block">NGN 100,000</span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
