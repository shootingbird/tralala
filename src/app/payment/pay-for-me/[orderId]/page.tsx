"use client";

import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { orderId } = useParams();

  // Extract values from URL
  const price = searchParams.get("price") || "0";
  const firstName = searchParams.get("firstName") || "Someone";

  console.log(price, orderId, firstName);

  return (
    <div className="min-h-screen flex justify-center px-4">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-300 py-10 space-y-3">
          <Image
            src="/icon.png"
            alt="staedfast logo"
            width={80}
            height={80}
            priority
            className="rounded-full shadow-md"
          />
          <p className="text-gray-700 text-sm md:text-base">
            <span className="font-semibold">{firstName}</span> has requested
            that you pay for their product on{" "}
            <span className="font-semibold">Steadfast</span>
          </p>
        </div>

        {/* Order Info */}
        <div className="py-6 border-b border-gray-300">
          <div className=" p-4 space-y-2">
            <p className="text-sm text-gray-500">Order Amount</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
              NGN {parseFloat(price).toLocaleString()}
            </h1>
          </div>

          {/* Payment Actions */}
          <div className="flex flex-col items-center space-y-3">
            <Button
              className="w-full py-3 text-base font-semibold"
              onClick={() => router.push(`/payment/${orderId}`)}
            >
              Make Payment
            </Button>
            <p className="text-xs text-gray-500">
              Link expires in{" "}
              <span className="font-semibold text-gray-700">60:00</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 leading-relaxed">
          For inquiries regarding this payment, please reach out to the person
          who shared this link with you or contact our{" "}
          <span className="text-blue-600 hover:underline cursor-pointer">
            support team
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default Page;
