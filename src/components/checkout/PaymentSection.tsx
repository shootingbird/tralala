'use client';

import OrderItems from '../cart/OrderItems';

type PaymentSectionProps = {
    shippingDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        state: string;
        city: string;
    };
    pickupLocation: {
        state: string;
        city: string;
        location: string | { value: string };
    };
    deliveryInfo: {
        fee: string;
        duration: string;
    };
};

export const PaymentSection = ({ pickupLocation, deliveryInfo, shippingDetails }: PaymentSectionProps) => {
    const pickupLocationValue = typeof pickupLocation.location === 'string' 
        ? pickupLocation.location 
        : pickupLocation.location?.value || null;
 
    return (
        <>
            <OrderItems
                selectedState={pickupLocation.state}
                selectedCity={pickupLocation.city}
                pickupLocation={pickupLocationValue}
                deliveryFee={deliveryInfo.fee}
                deliveryDuration={deliveryInfo.duration}
                shippingDetails={shippingDetails}
            />
        </>
    );
};