"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Percent, X } from "lucide-react";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StarIcon } from "@/components/icons/ShopIcons";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Button } from "@/components/ui/Button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CouponHelper, type Coupon } from "@/lib/coupons";
import Cookies from "js-cookie";
import { useVerifiedPromo } from "@/context/PadiCodeContext";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
  traceId: string;
}

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { verifiedPromoCode, setVerifiedPromoCode } = useVerifiedPromo();

  const [promoCode, setPromoCode] = useState<string>(
    verifiedPromoCode?.code || ""
  );
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [applyingCode, setApplyingCode] = useState<boolean>(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkoutType, setCheckoutType] = useState<"guest" | "signup" | null>(
    null
  );
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  // appliedPadiCode tracks whether a verified PADI code is active
  const [appliedPadiCode, setAppliedPadiCode] = useState<boolean>(
    !!verifiedPromoCode?.verified
  );
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [isAuthenticated] = useState(false); // replace with real auth

  // Derived subtotal from cartItems
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const FREE_SHIPPING_THRESHOLD = 53000;
  // Kept for coupon eligibility checks
  const DISCOUNT_ELIGIBILITY_THRESHOLD = 100000; // ₦100,000 threshold for coupons
  const AUTO_DISCOUNT_PERCENT = 2; // 2% discount when PADI code verified

  const progressPercentage = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal
  );
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Cart" }];

  useEffect(() => {
    const referralCoupon = Cookies.get("referral_coupon");
    if (referralCoupon) {
      setPromoCode(referralCoupon);
      setShowPromoInput(true);
    }
  }, []);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const coupons = await CouponHelper.getAllCoupons();
        setAvailableCoupons(coupons);
      } catch (err) {
        console.error("Failed to fetch coupons", err);
      }

      const saved = localStorage.getItem("appliedCoupon");
      if (saved) {
        try {
          const coupon = JSON.parse(saved) as Coupon;
          setAppliedCoupon(coupon);
        } catch (error) {
          console.error("Failed to parse saved coupon", error);
        }
      }
    };
    fetchCoupons();
  }, []);

  // Calculate coupon discount but only valid if subtotal >= threshold
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < DISCOUNT_ELIGIBILITY_THRESHOLD) return 0;
    return appliedCoupon.type === "percentage"
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value;
  }, [appliedCoupon, subtotal]);

  // PADI discount: applies only when PADI code is verified (no subtotal threshold)
  const padiDiscount = useMemo(() => {
    if (!appliedPadiCode) return 0;
    return (subtotal * AUTO_DISCOUNT_PERCENT) / 100;
  }, [appliedPadiCode, subtotal]);

  // Final discount (coupon takes precedence, else PADI discount)
  const totalDiscount = useMemo(() => {
    return couponDiscount > 0 ? couponDiscount : padiDiscount;
  }, [couponDiscount, padiDiscount]);

  const estimatedTotal = useMemo(() => {
    const total = Math.max(0, subtotal - totalDiscount);
    return total;
  }, [subtotal, totalDiscount]);

  const handleRemoveConfirm = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
    }
  };

  const handleAuthComplete = (isSuccessful?: boolean) => {
    setShowAuthModal(false);
    if (isSuccessful || checkoutType === "guest") {
      router.push("/checkout");
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    // Coupons only valid when subtotal >= threshold
    if (subtotal < DISCOUNT_ELIGIBILITY_THRESHOLD) {
      setCouponError(
        `Your cart must be at least ₦${DISCOUNT_ELIGIBILITY_THRESHOLD.toLocaleString()} to use coupons.`
      );
      return;
    }

    try {
      const verification = await CouponHelper.verifyCoupon(promoCode, subtotal);

      if (!verification.valid) {
        setCouponError(verification.message || "Invalid coupon code");
        return;
      }

      if (verification.coupon) {
        const coupon: Coupon = {
          id: verification.coupon.id,
          code: verification.coupon.code,
          type: verification.coupon.type as "percentage" | "fixed",
          value: verification.coupon.value,
          description: verification.coupon.description,
          minAmount: verification.coupon.minAmount ?? null,
          is_available: true,
        };
        setAppliedCoupon(coupon);
        localStorage.setItem("appliedCoupon", JSON.stringify(coupon));
        setShowPromoInput(false);
        setPromoCode("");
        setCouponError("");
      }
    } catch (error) {
      console.error(error);
      setCouponError("Failed to verify coupon");
    }
  };

  // PADI/party verification: only verify and store flag — affects totals via padiDiscount
  const applyPadiCoupon = async (padiCode: string): Promise<void> => {
    setApplyingCode(true);
    setCouponError("");

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/padi/verify-code?code=${encodeURIComponent(padiCode)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data: ApiResponse<any> = await response.json();

      if (data.success && data.statusCode === 200) {
        setAppliedPadiCode(true);
        setVerifiedPromoCode({ verified: true, code: padiCode });
        setCouponError("");
      } else {
        setAppliedPadiCode(false);
        setCouponError(data.message || "Invalid padi code");
      }
    } catch (error) {
      console.error("Error verifying padi code:", error);
      setAppliedPadiCode(false);
      setCouponError("Failed to verify padi code. Please try again.");
    } finally {
      setApplyingCode(false);
    }
  };

  const handleRemoveClick = (productId: string) => {
    setItemToRemove(productId);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setCheckoutType(null);
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <TopBanner theme="dark" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl px-2 pb-3 md:px-6">
          <Breadcrumb items={breadcrumbItems} className="pb-0  md:py-0" />
          <h1 className="text-lg md:text-2xl font-semibold mt-2 md:mt-4">
            Shopping cart
          </h1>
          <div className="my-4">
            <div className="flex items-center gap-1 text-sm mb-3">
              <span>Buy</span>
              <span className="font-medium">
                ₦{remainingForFreeShipping.toLocaleString()}
              </span>
              <span>more to get</span>
              <span className="font-medium">Free Shipping</span>
            </div>
            {/* helper message about discount eligibility */}
            {subtotal < DISCOUNT_ELIGIBILITY_THRESHOLD ? (
              <div className="text-sm text-gray-600">
                Add ₦
                {(DISCOUNT_ELIGIBILITY_THRESHOLD - subtotal).toLocaleString()}{" "}
                more to unlock discounts.
              </div>
            ) : (
              <div className="text-sm text-green-700">
                Cart eligible for discounts.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl px-2 md:px-6">
              <div className="relative h-1 mb-5 md:mb-0 bg-[#E0E5EB]  rounded-full ">
                <div
                  className="absolute left-0 top-0 h-full bg-[#FF8A65] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage > 0 && (
                    <div className="absolute -right-3 -top-2.5 w-6 h-6 flex items-center justify-center">
                      <StarIcon size={24} />
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden md:grid grid-cols-12 gap-4  py-[1.5rem] text-sm text-gray-500 border-b border-[#E0E5EB]">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1 text-right">Clear</div>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col md:grid md:grid-cols-12 gap-4 py-4 items-start md:items-center border-t border-[#E0E5EB]"
                >
                  <div className="flex gap-4 w-full md:w-auto md:col-span-5">
                    <div className="relative w-[40%] md:h-24 h-auto">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-2 flex-1">
                      <div className="flex justify-between gap-5 text-sm items-start">
                        <h3 className="font-medium">{item.title}</h3>
                        <span className="font-medium inline-flex md:hidden">
                          ₦{item.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Category:{" "}
                        <span className="text-black">{item.category}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Brand: <span className="text-black">{item.brand}</span>
                      </p>
                      <div className="flex items-center border-2 border-[#EDF0F8] rounded-xl w-fit mt-2 md:hidden">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variationId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-3 py-1.5"
                        >
                          −
                        </button>
                        <span className="w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variationId,
                              item.quantity + 1
                            )
                          }
                          className="px-3 py-1.5"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveClick(item.productId)}
                        className="text-gray-500 text-start hover:text-gray-600 text-sm md:hidden mt-2 mb-5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-2 text-right">
                    ₦{item.price.toLocaleString()}
                  </div>
                  <div className="hidden md:block md:col-span-2">
                    <div className="flex items-center justify-center border-2 border-[#EDF0F8] rounded-xl mx-auto">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variationId,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="px-3 py-2"
                      >
                        −
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variationId,
                            item.quantity + 1
                          )
                        }
                        className="px-3 py-2"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-2 text-right font-medium">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <div className="absolute top-4 right-4 md:static md:col-span-1 md:text-right">
                    <button
                      onClick={() => handleRemoveClick(item.productId)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="hidden md:block" size={20} />
                    </button>
                  </div>
                </div>
              ))}

              <Link
                href="/products"
                className="text-[#151515] font-medium text-sm block mt-6"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white flex flex-col-reverse md:flex-col  rounded-xl gap-6 md:p-6">
              <button
                onClick={() => setShowPromoInput(!showPromoInput)}
                className="w-full flex items-center justify-between py-3 px-4 bg-[#EDF0F8] rounded-xl"
              >
                <div className="flex gap-5">
                  <span className="font-bold flex flex-col items-center justify-center">
                    <Percent size={15} />
                  </span>
                  <span>Verify PADI code</span>
                </div>
                <span>{showPromoInput ? "-" : "+"}</span>
              </button>

              {showPromoInput && (
                <div className="mb-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                      }}
                      placeholder="Enter PADI code"
                      className="flex-1 p-2 border-2 border-[#EDF0F8] outline-0 rounded-xl"
                    />
                    <button
                      onClick={() => applyPadiCoupon(promoCode)}
                      className={
                        applyingCode
                          ? "px-4 bg-[#1E1E1E] text-white rounded-xl"
                          : "px-4 bg-[#184193] text-white rounded-xl"
                      }
                      disabled={applyingCode}
                    >
                      {applyingCode ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-sm">{couponError}</p>
                  )}
                  {appliedPadiCode && (
                    <p className="text-sm text-green-600">PADI verified</p>
                  )}
                </div>
              )}

              <div className="bg-[#EDF0F8] rounded-xl p-6">
                <h2 className="font-medium mb-4">Order summary</h2>
                <div className="space-y-3 text-sm border-t py-3 border-[#E0E5EB]">
                  <div className="flex py-3 justify-between">
                    <span>Subtotal ({cartItems.length} items):</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>

                  {/* Coupon line (only if coupon applied and eligible) */}
                  {appliedCoupon &&
                    subtotal >= DISCOUNT_ELIGIBILITY_THRESHOLD && (
                      <div className="flex py-1 justify-between text-green-600">
                        <span>Coupon ({appliedCoupon.code}):</span>
                        <span>-₦{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}

                  {/* PADI discount (applies only if PADI verified and no coupon applied) */}
                  {!appliedCoupon && appliedPadiCode && padiDiscount > 0 && (
                    <div className="flex py-1 justify-between text-green-600">
                      <span>PADI Discount:</span>
                      <span>-₦{padiDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex py-1 pb-6 justify-between text-gray-500">
                    <span>Shipping:</span>
                    <span className="text-black">Calculated at checkout</span>
                  </div>

                  <div className="flex pt-6 justify-between border-t border-[#E0E5EB] font-medium">
                    <span>Estimated total:</span>
                    <span>₦{estimatedTotal.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 bg-[#184193] text-white rounded-xl mt-4"
                >
                  Proceed to checkout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
        <ConfirmationModal
          isOpen={!!itemToRemove}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setItemToRemove(null)}
          title="Remove from Cart"
          message="Are you sure you want to remove this item from your cart? If you change your mind, you'll need to add the item again."
        />
        <AuthModal isOpen={showAuthModal} onClose={handleAuthComplete} />
      </main>
    </>
  );
}
