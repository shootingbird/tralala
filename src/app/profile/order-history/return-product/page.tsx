"use client";

import { useState } from "react";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import ReturnProgressBar from "./components/ReturnProgressBar";
import OrderStep from "./components/OrderStep";
import ReasonStep from "./components/ReasonStep";
import ResolutionStep from "./components/ResolutionStep";
import ConfirmationStep from "./components/ConfirmationStep";

type ReturnProgressStep = "order" | "reason" | "resolution" | "confirmation";

export default function ReturnProduct() {
  const query = useSearchParams();
  const orderId = query.get("orderId");
  const [returnStep, setReturnStep] = useState<ReturnProgressStep>("order");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Order History", href: "/profile/order-history" },
    { label: "Return Product" },
  ];

  return (
    <>
      <TopBanner theme="dark" />
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto md:px-4 py-10">
          <Breadcrumb items={breadcrumbItems} className="mb-6 px-4 md:px-0" />

          <section className="bg-white px-4 md:px-6 py-6 flex flex-col gap-6">
            <h2 className="text-xl md:text-2xl text-black font-semibold">
              Return Product
            </h2>

            <div className="md:border px-4 md:p-4 rounded-md">
              <ReturnProgressBar returnStatus={returnStep} className="w-full" />

              <div>
                {returnStep === "order" ? (
                  <OrderStep />
                ) : returnStep === "reason" ? (
                  <ReasonStep />
                ) : returnStep === "resolution" ? (
                  <ResolutionStep />
                ) : returnStep === "confirmation" ? (
                  <ConfirmationStep />
                ) : (
                  "error"
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
