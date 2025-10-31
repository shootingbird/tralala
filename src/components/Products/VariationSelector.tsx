"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Product, Variation } from "@/types/product";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart } from "@/slices/cartSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Card } from "../ui/card";
import { useToast } from "../ui/toast";

type VariationWithQty = Variation & { qty: number };

const currency = (n: number) => `₦${n.toLocaleString()}`;

function QuantityControl({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full bg-white border border-gray-200 shadow-sm p-1"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(Math.max(0, value - 1));
        }}
        aria-label="Decrease quantity"
        className="flex items-center justify-center w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 hover:bg-gray-50"
      >
        <Minus size={16} />
      </button>

      <div className="w-10 text-center font-medium text-sm px-2">{value}</div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(value + 1);
        }}
        aria-label="Increase quantity"
        className="flex items-center justify-center w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 hover:bg-gray-50"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function VariationRow({
  variation,
  onQtyChange,
}: {
  variation: VariationWithQty;
  onQtyChange: (id: string, qty: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex-1">
        <div className="text-sm text-gray-700">{variation.variation}</div>
      </div>

      <div className="w-28 text-right text-sm text-gray-900 font-semibold">
        {currency(variation.price)}
      </div>

      <div className="w-36 flex justify-end ml-6">
        <QuantityControl
          value={variation.qty}
          onChange={(v) => onQtyChange(variation.id, v)}
          ariaLabel={`Quantity for ${variation.variation}`}
        />
      </div>
    </div>
  );
}

interface VariationSelectorProps {
  product: Product;
  children: React.ReactNode; // trigger (button or whatever)
}

export default function VariationSelector({
  product,
  children,
}: VariationSelectorProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // controls open state shared between Sheet and Dialog
  const [open, setOpen] = useState(false);

  // detect mobile for choosing Sheet vs Dialog (mobile-first)
  const [isMobile, setIsMobile] = useState<boolean>(true);
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 640); // <640px = sm breakpoint
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Initialize variations with qty = 0
  const [variations, setVariations] = useState<VariationWithQty[]>(
    () => product.variations.map((v: Variation) => ({ ...v, qty: 0 })) // lazy init
  );

  useEffect(() => {
    // If product changes, re-init variations
    setVariations(product.variations.map((v: Variation) => ({ ...v, qty: 0 })));
  }, [product]);

  function handleQtyChange(id: string, qty: number) {
    setVariations((prev) => prev.map((v) => (v.id === id ? { ...v, qty } : v)));
  }

  const totalItems = variations.reduce((s, v) => s + v.qty, 0);

  const handleAddToCart = () => {
    variations.forEach((variation) => {
      if (variation.qty > 0) {
        dispatch(
          addToCart({
            productId: product.productId.toString(),
            variationId: variation.id,
            title: product.title,
            image: (product.images && product.images[0]) || "/placeholder.jpg",
            price: variation.price,
            quantity: variation.qty,
            variationName: variation.variation,
          })
        );
      }
    });

    // close and reset quantities
    setOpen(false);
    setVariations((prev) => prev.map((v) => ({ ...v, qty: 0 })));

    // Show success toast
    showToast(`${totalItems} item(s) added to cart successfully!`, "success");
  };

  // content shared between the Sheet and Dialog to avoid duplication
  const SharedContent = (
    <div
      className="relative bg-white px-6 h-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex gap-4 sm:gap-6">
        {/* Image */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
            <Image
              src={(product.images && product.images[0]) || "/placeholder.jpg"}
              alt={product.title}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Title & price */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-medium text-gray-900">
            {product.title}
          </h3>
          <div className="mt-2 text-lg sm:text-xl font-semibold text-gray-900">
            {currency(product.price)}
          </div>
        </div>
      </div>

      {/* Variation header */}
      <div className="mt-6">
        <div className="text-sm font-medium text-gray-700 mb-3">Variation</div>

        <div className="divide-y max-h-[240px] overflow-y-auto">
          {variations.map((v) => (
            <VariationRow
              key={v.id}
              variation={v}
              onQtyChange={handleQtyChange}
            />
          ))}
        </div>
      </div>

      {/* Add to cart */}
      <div className="mt-6">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={totalItems === 0}
          className="w-full rounded-full py-3 text-white bg-[#E6512D] hover:bg-[#D84323] active:scale-[0.997] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E6512D] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add to cart"
        >
          <span className="font-medium">Add to Cart</span>
        </Button>

        <div className="mt-3 text-center text-xs text-gray-500">
          {totalItems} item(s) selected
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Choose Sheet for mobile and Dialog for desktop */}
      {isMobile ? (
        // Mobile: Sheet (bottom drawer) - uses side="bottom" to slide up
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{children}</SheetTrigger>

          <SheetContent
            side="bottom"
            className="rounded-t-2xl p-0 shadow-2xl max-w-none"
          >
            <Card
              className="h-full overflow-hidden border-0"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetHeader>
                <SheetTitle className="sr-only">
                  {product.title} — variations
                </SheetTitle>
              </SheetHeader>

              {/* content */}
              <div className="h-full overflow-y-auto">{SharedContent}</div>

              {/* optional footer spacing */}
              {/* <SheetFooter className="p-4" /> */}
            </Card>
          </SheetContent>
        </Sheet>
      ) : (
        // Desktop: Dialog centered modal
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{children}</DialogTrigger>

          <DialogContent className="" onClick={(e) => e.stopPropagation()}>
            <div className="relative">{SharedContent}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
