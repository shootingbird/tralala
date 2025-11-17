"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ShippingAddressSection } from "@/components/checkout/ShippingAddressSection";
import { PickupSection } from "@/components/checkout/PickupSection";
import { PaymentSection } from "@/components/checkout/PaymentSection";
import { TopBanner } from "@/components/layout/TopBanner";
import { type Coupon } from "@/lib/coupons";
import AppWapper from "@/app/AppWapper";
import Header from "@/components/shared/Header";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
  traceId: string;
}

export type ApiZone = {
  id?: number;
  state: string;
  city?: string;
  fee: number | string;
  duration: string;
  pickups: string[];
  is_active?: boolean;
  // any extra fields the API returns
  [key: string]: any;
};

interface Zone {
  city: string;
  duration: string;
  fee: number;
  id: number;
  is_active: boolean;
  lga: string | null;
  pickups: string[];
  state: string;
}

export default function CheckoutPage() {
  return (
    <AppWapper>
      <CheckoutPageContent />
    </AppWapper>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const [applyingCode, setapplyingCode] = useState<boolean>(false);
  const [fullTotal, setfullTotal] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedState, setSelectedState] = useState("");
  let subtotal = 0;
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const [pickupData, setPickupData] = useState<any>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    fee: string;
    duration: string;
    id?: number;
  }>({ fee: "", duration: "" });
  const [disableContinue, setDisableContinue] = useState(false);
  const [zonesData, setZonesData] = useState<Zone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  // const { user } = useAuth();

  useEffect(() => {
    const fetchZones = async () => {
      setIsLoadingZones(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/zones?active=true&page=1&per_page=200`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch zones");
        }
        const data = await response.json();
        setZonesData(data.zones);
      } catch (error) {
        console.error("Error fetching zones:", error);
      } finally {
        setIsLoadingZones(false);
      }
    };

    fetchZones();
  }, []);

  const handleBack = () => {
    window.scrollTo(0, 0);
    if (currentStep === 1) {
      router.push("/cart");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const applyPadiCoupon = async (padiCode: string): Promise<void> => {
    setapplyingCode(true);
    try {
      const response = await fetch(
        `https://steadfast-padi-backend.pxxl.tech/api/payment/${padiCode}/verify-padi-code`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: ApiResponse<Coupon> = await response.json();

      if (data.success && data.statusCode == 200) {
        const discountedTotal = 0.98 * subtotal;
        subtotal = discountedTotal;
        setfullTotal(subtotal);
      } else {
        console.log("Coupon verification failed:", data.message);
      }
    } catch (error) {
      console.error("Error verifying coupon:", error);
    } finally {
      setapplyingCode(false);
    }
  };

  const handleContinue = async () => {
    window.scrollTo(0, 0);
    if (currentStep === 1 && !selectedState) {
      alert("Please select a state before proceeding");
      return;
    }
    if (currentStep === 2 && !pickupData?.pickup) {
      alert("Please select a pickup point before proceeding");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/payment");
    }
  };

  return (
    <>
      <TopBanner theme="dark" />
      <Header isProductPage={false} showSearchbar={false} />
      <div className="container mx-auto px-4 pb-8 ">
        <div className="container mx-auto px-4 md:py-2 max-w-3xl">
          <div className="flex justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#E94B1C] rounded-full flex items-center justify-center text-white text-sm font-medium mb-2">
                1
              </div>
              <span className="text-xs">Add Items</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 ${
                  currentStep >= 1 ? "bg-[#E94B1C]" : "bg-gray-200"
                } rounded-full flex items-center justify-center text-white text-sm font-medium mb-2`}
              >
                2
              </div>
              <span className="text-xs">Shipping Address</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 ${
                  currentStep >= 2 ? "bg-[#E94B1C]" : "bg-gray-200"
                } rounded-full flex items-center justify-center text-white text-sm font-medium mb-2`}
              >
                3
              </div>
              <span className="text-xs">Pick Up Point</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 ${
                  currentStep >= 3 ? "bg-[#E94B1C]" : "bg-gray-200"
                } rounded-full flex items-center justify-center text-white text-sm font-medium mb-2`}
              >
                4
              </div>
              <span className="text-xs">Checkout</span>
            </div>
          </div>
        </div>
        <div className={`${currentStep != 3 && "container mx-auto max-w-3xl"}`}>
          <div className="space-y-6">
            {currentStep === 1 && (
              <ShippingAddressSection
                onStateSelect={setSelectedState}
                onCitySelect={setSelectedCity}
                onShippingDetailsChange={setShippingDetails}
                setDisableContinue={setDisableContinue}
                zonesData={zonesData}
                isLoadingZones={isLoadingZones}
                onZoneSelect={setSelectedZone}
              />
            )}
            {currentStep === 2 && (
              <PickupSection
                selectedState={selectedState}
                onPickupSelect={setPickupData}
                onDeliveryInfoChange={(zone) => {
                  if (zone) {
                    setDeliveryInfo({
                      fee: String(zone.fee ?? 0),
                      duration: zone.duration ?? "",
                      id: zone.id,
                    });
                  } else {
                    setDeliveryInfo({ fee: "0", duration: "", id: undefined });
                  }
                }}
                selectedZone={selectedZone ? { ...selectedZone, lga: selectedZone.lga ?? undefined } : null}
              />
            )}
            {currentStep === 3 && (
              <PaymentSection
                shippingDetails={shippingDetails}
                pickupLocation={{
                  state: selectedState,
                  city: selectedCity,
                  location: pickupData?.pickup,
                }}
                deliveryInfo={deliveryInfo}
                zonesData={zonesData}
              />
            )}
          </div>

          <div className="flex px-2 md:flex-row gap-5  justify-between items-center mt-5">
            {currentStep === 1 && (
              <Button
                onClick={handleBack}
                // variant="secondary_outline"
                className="flex-1 bg-transparent text-[#E94B1C] hover:bg-gray-100 border border-[#E94B1C]"
              >
                Go back
              </Button>
            )}

            {currentStep <= 2 && (
              <div className="flex-1">
                <div
                  className={`${currentStep === 2 ? "mx-auto max-w-sm" : ""}`}
                >
                  <Button
                    onClick={handleContinue}
                    disabled={disableContinue}
                    className={`w-full ${currentStep === 2 ? "rounded-full" : ""} ${
                      disableContinue
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {currentStep === 3
                      ? "Proceed to Payment"
                      : currentStep === 2
                      ? "Checkout"
                      : "Continue"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
