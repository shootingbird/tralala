"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { CreditCard, Info, X } from "lucide-react";
import { LiaUserFriendsSolid } from "react-icons/lia";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { CouponHelper } from "@/lib/coupons";
import { useAuth } from "@/contexts/AuthContext";
import PayForMeDialog from "../checkout/PayForMeDialog";
import { useVerifiedPromo } from "@/context/PadiCodeContext";

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  wattage?: string;
  color?: string;
  description?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
  traceId: string;
}

interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount: number | null;
  description: string;
}

interface OrderItemsProps {
  selectedState: string;
  selectedCity: string;
  pickupLocation: string | null;
  deliveryFee: string;
  deliveryDuration: string;
  shippingDetails: any;
}

const FREE_SHIPPING_THRESHOLD = 53000;

const paymentOptions = [
  {
    id: "pay_now",
    label: "Pay now",
    icon: <CreditCard className="w-5 h-5 mr-2" />,
  },
  {
    id: "pay_for_me",
    label: "Pay for me",
    icon: <LiaUserFriendsSolid className="w-5 h-5 mr-2" />,
  },
];

export default function OrderItems({
  selectedState,
  selectedCity,
  pickupLocation,
  deliveryFee,
  deliveryDuration,
  shippingDetails,
  deliveryInfo,
}: OrderItemsProps) {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { getToken } = useAuth();

  // UI / local state
  // const [promoCode, setPromoCode] = useState<string>("");
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("pay_now");
  const [payFormeLink, setPayFormeLink] = useState<string>("");
  const { verifiedPromoCode } = useVerifiedPromo();

  // Derived values (memoized)
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.type === "percentage"
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value;
  }, [appliedCoupon, subtotal]);

  // Business decision: Padi code (2% off) takes precedence over appliedCoupon.
  // If you want both to stack, change this logic accordingly.
  const fullTotal = useMemo(() => {
    if (subtotal >= 100000) return Math.round(subtotal * 0.98);
    return Math.max(0, subtotal - couponDiscount);
  }, [subtotal, couponDiscount]);

  const deliveryFeeNumber = useMemo(() => {
    // free shipping when subtotal >= threshold
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    const parsed = parseInt(deliveryFee || "0", 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [deliveryFee, subtotal]);

  // Restore applied coupon from localStorage and fetch available coupons (side-effect)
  useEffect(() => {
    (async () => {
      try {
        await CouponHelper.getAllCoupons(); // we don't use them directly here, but keep the call to warm cache if the helper does
        const saved = localStorage.getItem("appliedCoupon");
        if (saved) {
          setAppliedCoupon(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to load coupons:", err);
      }
    })();
  }, []);

  const handleRemoveClick = useCallback((productId: string) => {
    setItemToRemove(productId);
  }, []);

  const handleRemoveConfirm = useCallback(() => {
    if (!itemToRemove) return;
    removeFromCart(itemToRemove);
    setItemToRemove(null);
  }, [itemToRemove, removeFromCart]);

  console.log(selectedCity);
  // Create order and redirect to payment
  const handlePayment = useCallback(async () => {
    const token = Cookies.get("token");

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        ...(token ? {} : { tempuser: true }),
        as_guest: token ? false : true,
        contact: {
          first_name: shippingDetails?.firstName || "",
          last_name: shippingDetails?.lastName || "",
          email: shippingDetails?.email || "",
          phone: shippingDetails?.phone || "",
        },
        shipping: {
          state: selectedState,
          city: selectedCity || deliveryInfo?.city,
          address: shippingDetails?.address || "",
        },

        delivery: {
          pickup_location: pickupLocation,
          id: deliveryInfo.id,
        },

        items: cartItems.map(({ productId, quantity, variationId }) => ({
          product_id: productId,
          quantity,
          ...(variationId != null ? { variation_id: variationId } : {}),
        })),
        padicode:
          (verifiedPromoCode.verified && verifiedPromoCode?.code) || null,
        notes: "Leave at the gate",

        // total_amount: fullTotal + deliveryFeeNumber,
        // payment_status: "unpaid",

        // delivery_info: {
        //   fee: deliveryFeeNumber,
        //   duration: deliveryDuration,
        // },
      };

      console.log(payload);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Order creation failed:", res.status, text);
        throw new Error("Failed to create order");
      }

      const { data } = await res.json();
      console.log(data);
      clearCart();
      localStorage.removeItem("appliedCoupon");
      if (selectedPayment !== "pay_now") {
        setPayFormeLink(
          `${process.env.NEXT_PUBLIC_ROUTE}/payment/pay-for-me/${data?.order_id}?price=${data.amounts?.total}&firstName=${data?.contact?.first_name}`
        );
        return;
      }

      router.push(`/payment/${data?.order_id}`);
    } catch (err) {
      console.error("Payment flow error:", err);
      alert("Failed to process order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    cartItems,
    getToken,
    fullTotal,
    deliveryFeeNumber,
    appliedCoupon,
    selectedState,
    selectedCity,
    pickupLocation,
    deliveryDuration,
    clearCart,
    router,
    shippingDetails,
    selectedPayment,
  ]);

  console.log(deliveryInfo);

  // Render: keep your exact UI but wire to the improved logic above
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <div className="bg-white rounded-xl px-2 md:px-6">
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
                <div className="relative w-[120px] md:h-24 h-auto">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover md:rounded-lg"
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
                    Color: <span className="text-black">{item.color}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Variation:{" "}
                    <span className="text-black">{item.description}</span>
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
                    <span className="w-12 text-center">{item.quantity}</span>
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
                        item?.variationId,
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
                        item?.variationId,
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
        </div>
      </div>

      <div className="lg:w-1/3">
        <div className="bg-white flex flex-col-reverse md:flex-col  rounded-xl md:p-6">
          <div className="flex flex-col gap-4">
            <div className="bg-[#EDF0F8] rounded-xl p-6">
              <h2 className="text-xl text-center font-semibold mb-4">
                Order summary
              </h2>
              <div className="space-y-3 text-sm border-t py-3 border-[#E0E5EB]">
                <div className="flex py-3 justify-between">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex py-1 justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code}):</span>
                    <span>-₦{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                {subtotal >= 100000 && (
                  <div className="flex py-1 pb-3 justify-between text-gray-500">
                    <span>Savings</span>
                    <span className="text-red-500">
                      -₦{Math.round(subtotal * 0.02).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex py-1 pb-6 justify-between text-gray-500">
                  <span>Shipping:</span>
                  <span className="text-black">
                    {selectedState
                      ? `₦${deliveryInfo?.fee?.toLocaleString()} (${deliveryDuration})`
                      : "Select state to calculate"}
                  </span>
                </div>

                <div className="flex pt-6 justify-between border-t border-[#E0E5EB] font-medium">
                  <span>Estimated total:</span>
                  <span className="text-xl font-semibold ">
                    ₦{(fullTotal + deliveryInfo?.fee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex py-4 font-medium bg-[#EDF0F8] rounded-md px-6">
              <span>Payment Method</span>
            </div>

            <div className="flex flex-col w-full gap-2">
              {paymentOptions.map((option) => (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-center justify-between gap-5 py-3 px-4 cursor-pointer hover:bg-gray-50 ${
                    option.id === "pay_now" ? "border-b" : "border-none"
                  }`}
                >
                  {/* Icon + Label */}
                  <div>
                    <div
                      className={`flex ${
                        option.id === "pay_now" ? "items-center" : ""
                      }`}
                    >
                      <span>{option.icon}</span>
                      <div>
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                        {option.id != "pay_now" && (
                          <div className="flex gap-1 mt-1">
                            <Info className="text-[8px] w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-[#667085] max-w-70">
                              Share a payment link with friends and loved ones
                              for them to pay on your behalf
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Custom Large Radio */}
                  <div className={`relative flex items-center`}>
                    <input
                      type="radio"
                      name="payment_method"
                      id={option.id}
                      value={option.id}
                      checked={selectedPayment === option.id}
                      onChange={() => setSelectedPayment(option.id)}
                      aria-checked={selectedPayment === option.id}
                      className="peer appearance-none w-3 h-3 rounded-full   checked:bg-[#184193] border-none   transition-colors ring-4 ring-gray-600 checked:ring-[#184193] outline-3 outline-white
"
                    />
                  </div>
                </label>
              ))}
            </div>
            {selectedPayment === "pay_now" ? (
              <Button
                onClick={handlePayment}
                rounded={true}
                disabled={cartItems.length === 0 || isLoading}
                className={`w-full py-3 px-4 bg-[#184193] text-white rounded-full mt-4 ${
                  isLoading || cartItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? "Processing..." : "Proceed to payment"}
              </Button>
            ) : (
              <PayForMeDialog
                cartItems={cartItems}
                paymentLink={payFormeLink}
                isLoading={isLoading}
                onPaymentClick={handlePayment}
              />
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={!!itemToRemove}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setItemToRemove(null)}
        title="Remove from Cart"
        message="Are you sure you want to remove this item from your cart? If you change your mind, you'll need to add the item again."
      />
    </div>
  );
}
