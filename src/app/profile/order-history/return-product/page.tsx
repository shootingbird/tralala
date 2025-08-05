"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import ReturnProgressBar from "./components/ReturnProgressBar";
import OrderStep from "./components/OrderStep";
import ReasonStep from "./components/ReasonStep";
import ResolutionStep from "./components/ResolutionStep";
import ConfirmationStep from "./components/ConfirmationStep";

enum ReturnStep {
  ORDER = "order",
  REASON = "reason",
  RESOLUTION = "resolution",
  CONFIRMATION = "confirmation",
}

type Product = {
  image: string;
  name: string;
  category: string;
  variation: string;
  price: number;
  orderId: string;
  product_qty: number;
  createdAt: string;
  status: string;
  placedDate: string;
};

const product: Product = {
  image: "/dummyImage/order2.png",
  name: "Modern Outdoor Lightening unit - White finish",
  category: "OUTDOOR LIGHTING",
  variation: "36 Watt",
  price: 94099,
  orderId: "#100002",
  product_qty: 1,
  createdAt: "2025-07-30T12:30:00Z",
  status: "Delivered",
  placedDate: "2025-07-29T16:00:00Z",
};

export default function ReturnProduct() {
  const query = useSearchParams();
  const orderId = query.get("orderId");
  const [returnStep, setReturnStep] = useState<ReturnStep>(ReturnStep.ORDER);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Order History", href: "/profile/order-history" },
    { label: "Return Product" },
  ];

  const renderStep = () => {
    switch (returnStep) {
      case ReturnStep.ORDER:
        return (
          <OrderStep onClickNext={() => setReturnStep(ReturnStep.REASON)} />
        );
      case ReturnStep.REASON:
        return (
          <ReasonStep
            onClickNext={() => setReturnStep(ReturnStep.RESOLUTION)}
          />
        );
      case ReturnStep.RESOLUTION:
        return (
          <ResolutionStep
            onClickNext={() => setReturnStep(ReturnStep.CONFIRMATION)}
          />
        );
      case ReturnStep.CONFIRMATION:
        return <ConfirmationStep />;
      default:
        return <p>Step not found</p>;
    }
  };

  return (
    <>
      <TopBanner theme="dark" />
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto md:px-4 py-10">
          <Breadcrumb
            items={breadcrumbItems}
            className="md:mb-6 px-4 md:px-0"
          />

          <section className="bg-white px-4 md:px-6 py-6 flex flex-col gap-6">
            <h2 className="text-xl md:text-2xl text-black font-semibold">
              Return Product
            </h2>

            <div className="md:border md:py-6 md:px-4 rounded-md container mx-auto max-w-6xl">
              {returnStep === ReturnStep.REASON && (
                <div className="flex justify-between items-center gap-4 md:gap-6 group transition-all duration-200 hover:bg-gray-50 rounded-xl border border-[#184193] p-2 md:p-6 md:w-[90%] m-auto mb-16">
                  <div className="flex items-center gap-4 md:gap-6 w-full">
                    <div className="w-15 h-15 md:w-16 md:h-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={product.image}
                        alt={`Product(s) for Order ${orderId}`}
                        width={208}
                        height={176}
                        priority
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                      <div className="w-full">
                        <p className="text-xs md:text-base font-medium md:max-w-md text-gray-700">
                          {`${product.name}, ${product.variation} Variant`}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 mt-2">
                          {orderId} Delivery Date:{" "}
                          {format(new Date(product.placedDate), "MMMM d, yyyy")}
                        </p>
                      </div>

                      <p className="font-semibold text-sm md:text-3xl text-[#184193] whitespace-nowrap md:mr-25">
                        NGN{" "}
                        {new Intl.NumberFormat("en-NG", {
                          minimumFractionDigits: 2,
                        }).format(product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4">
                <ReturnProgressBar
                  returnStatus={returnStep}
                  className="w-full"
                />
              </div>

              <div className="py-6 md:px-4 md:mt-10">{renderStep()}</div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
