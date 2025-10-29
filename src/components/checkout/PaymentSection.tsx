"use client";

import OrderItems from "../cart/OrderItems";

type PaymentSectionProps = {
  shippingDetails: any;
  pickupLocation: {
    state: string;
    city: string;
    location: any;
  };
  deliveryInfo: {
    fee: string;
    duration: string;
    id?: number;
  };
  zonesData?: any[];
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
