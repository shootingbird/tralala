"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "../ui/Button";

export default function PayForMeDialog({
  cartItems,
  isLoading,
  paymentLink,
  onPaymentClick,
}: {
  cartItems: any[];
  isLoading: boolean;
  paymentLink: string;
  onPaymentClick: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2s
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pay for my order",
          text: "Please help me complete this payment",
          url: paymentLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // fallback if share not supported
      await handleCopy();
      alert("Share not supported on this device. Link copied instead!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={onPaymentClick}
          rounded={true}
          disabled={cartItems.length === 0 || isLoading}
          className={`w-full py-3 px-4 bg-[#184193] text-white rounded-full mt-4 ${
            isLoading || cartItems.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isLoading ? "Generating..." : "Generate Payment Link"}
        </Button>
      </DialogTrigger>

      <DialogContent className="">
        <div className="flex flex-col justify-between">
          <DialogHeader className="w-full h-48">
            <Image
              src="/payformeSuccess.png"
              alt="Pay for me Success image"
              fill
              className="max-h-48 w-full"
            />
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Link Created</h3>
            <p className="text-sm text-gray-600">
              Share this link with friends and family to pay for your order. If
              payment is not received in 1 hour, this link will expire and your
              order will be cancelled automatically.
            </p>

            <Button
              rounded={true}
              onClick={handleCopy}
              className="w-full py-3 px-4 bg-[#184193] text-white rounded-full"
            >
              {copied ? "Copied!" : "Copy Link"}
            </Button>

            <Button
              rounded={true}
              onClick={handleShare}
              className="w-full py-3 bg-white px-4 b text-gray-800 rounded-full hover:bg-gray-200"
            >
              <span className="text-gray-800">Share Link</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
