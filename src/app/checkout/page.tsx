'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ShippingAddressSection } from '@/components/checkout/ShippingAddressSection';
import { PickupSection } from '@/components/checkout/PickupSection';
import { PaymentSection } from '@/components/checkout/PaymentSection';
import { TopBanner } from '@/components/layout/TopBanner';
import { Header } from '@/components/layout/Header';

export default function CheckoutPage() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any    
    const [shippingDetails, setShippingDetails] = useState<any>(null);
    const [pickupData, setPickupData] = useState<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any    
        pickup: any;
        fee: string;
        duration: string;
    } | null>(null);
    const [deliveryInfo, setDeliveryInfo] = useState<{ fee: string; duration: string }>({ fee: '', duration: '' });

    // console.log(shippingDetails)

    const handleBack = () => {
        window.scrollTo(0, 0);
        if (currentStep === 1) {
            router.push('/cart');
        } else {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleContinue = async () => {
        window.scrollTo(0, 0);
        if (currentStep === 1 && !selectedState) {
            alert('Please select a state before proceeding');
            return;
        }
        if (currentStep === 2 && !pickupData?.pickup) {
            alert('Please select a pickup point before proceeding');
            return;
        }
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
             
        } else {
            router.push('/payment');
        }
    };

    return (
        <>
            <TopBanner theme="dark" />
            <Header />
            <div className="container mx-auto px-4 py-8 ">
                <div className="container mx-auto px-4 md:py-2 max-w-3xl">
                    <div className="flex justify-between mb-8">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-[#184193] rounded-full flex items-center justify-center text-white text-sm font-medium mb-2">
                                1
                            </div>
                            <span className="text-xs">Add Items</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-[#184193]' : 'bg-gray-200'} rounded-full flex items-center justify-center text-white text-sm font-medium mb-2`}>
                                2
                            </div>
                            <span className="text-xs">Shipping Address</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-[#184193]' : 'bg-gray-200'} rounded-full flex items-center justify-center text-white text-sm font-medium mb-2`}>
                                3
                            </div>
                            <span className="text-xs">Pick Up Point</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-[#184193]' : 'bg-gray-200'} rounded-full flex items-center justify-center text-white text-sm font-medium mb-2`}>
                                4
                            </div>
                            <span className="text-xs">Checkout</span>
                        </div>
                    </div>

                </div>
                <div className={`${currentStep != 3 && 'container mx-auto max-w-3xl'}`}>

                    <div className="space-y-6">
                        {currentStep === 1 && (
                            <ShippingAddressSection
                                onStateSelect={setSelectedState}
                                onCitySelect={setSelectedCity}
                                onShippingDetailsChange={setShippingDetails}
                            />
                        )}
                        {currentStep === 2 && (
                            <PickupSection
                                selectedState={selectedState}
                                onPickupSelect={setPickupData}
                                onDeliveryInfoChange={setDeliveryInfo}
                            />
                        )}
                        {currentStep === 3 && (
                            <PaymentSection
                                shippingDetails={shippingDetails}
                                pickupLocation={{
                                    state: selectedState,
                                    city: selectedCity,
                                    location: pickupData?.pickup
                                }}
                                deliveryInfo={{
                                    fee: deliveryInfo?.fee || '',
                                    duration: deliveryInfo?.duration || ''
                                }}
                            />
                        )}
                    </div>

                    <div className="flex px-2 md:flex-row gap-5  justify-between items-center mt-5">
                        {currentStep === 1 && (
                            <Button
                                onClick={handleBack}
                                variant="secondary_outline"
                                className="w-full"
                            >
                                Go back
                            </Button>
                        )
                        }

                        {currentStep <= 2 && (

                            <div className=" w-full ">
                                <div className={`${currentStep === 2 && 'mx-auto max-w-sm'}`}>
                                    <Button onClick={handleContinue} rounded={currentStep === 2} className="w-full">
                                        {currentStep === 3
                                            ? 'Proceed to Payment'
                                            : currentStep === 2
                                                ? 'Checkout'
                                                : 'Continue'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div >
        </>
    );
}