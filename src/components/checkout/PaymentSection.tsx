"use client";

import OrderItems from "../cart/OrderItems";
import { ApiZone } from "@/lib/pickupUtils";

type ShippingDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  note: string;
};

type PickupLocation = {
  state: string;
  city: string;
  location: string | { value: string } | null;
};

type PaymentSectionProps = {
  shippingDetails: ShippingDetails | null;
  pickupLocation: PickupLocation;
  deliveryInfo: {
    fee: string;
    duration: string;
    id?: number;
  };
  zonesData?: ApiZone[];
};

export const PaymentSection = ({
  pickupLocation,
  deliveryInfo,
  shippingDetails,
  zonesData,
}: PaymentSectionProps) => {
  const pickupLocationValue =
    typeof pickupLocation.location === "string"
      ? pickupLocation.location
      : pickupLocation.location?.value || null;
  console.log(deliveryInfo);
  return (
    <>
      <OrderItems
        selectedState={pickupLocation.state}
        selectedCity={pickupLocation.city}
        pickupLocation={pickupLocationValue}
        deliveryFee={deliveryInfo.fee}
        deliveryDuration={deliveryInfo.duration}
        deliveryInfo={deliveryInfo}
        shippingDetails={shippingDetails}
        zonesData={zonesData}
      />
    </>
  );
};
