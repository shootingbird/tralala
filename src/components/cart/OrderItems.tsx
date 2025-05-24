'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Percent, X } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CouponHelper } from '@/lib/coupons';
import { useAuth } from '@/contexts/AuthContext';

// Remove unused CartItem interface

interface Coupon {
    code: string;
    type: 'percentage' | 'fixed';
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
    shippingDetails: {
        address?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
    };
}

export default function OrderItems({
    selectedState,
    selectedCity,
    pickupLocation,
    deliveryFee,
    deliveryDuration,
    shippingDetails
}: OrderItemsProps) {
    const router = useRouter();
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const [promoCode, setPromoCode] = useState('');
    const [showPromoInput, setShowPromoInput] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const { getToken } = useAuth(); // Remove unused user variable
    const [orderNote, setOrderNote] = useState('');
 
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingThreshold = 53000;

    console.log('Shipping Details:', shippingDetails);


    useEffect(() => {
        const fetchCoupons = async () => {
            const coupons = await CouponHelper.getAllCoupons();
            setAvailableCoupons(coupons);

            const savedCoupon = localStorage.getItem('appliedCoupon');
            if (savedCoupon) {
                try {
                    const coupon = JSON.parse(savedCoupon);
                    setAppliedCoupon(coupon);
                } catch (error) {
                    console.error('Failed to parse saved coupon: ', error);
                }
            }
        };
        fetchCoupons();
    }, []);


    const handleApplyCoupon = async () => {
        setCouponError('');
        try {
            const verification = await CouponHelper.verifyCoupon(promoCode, subtotal);

            if (!verification.valid) {
                setCouponError(verification.message || 'Invalid coupon code');
                return;
            }

            if (verification.coupon) {
                const coupon: Coupon = {
                    code: verification.coupon.code,
                    type: verification.coupon.type as 'percentage' | 'fixed',
                    value: verification.coupon.value,
                    description: verification.coupon.description,
                    minAmount: null
                };
                setAppliedCoupon(coupon);
                localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
                setShowPromoInput(false);
                setPromoCode('');
            }
        } catch (error) {
            setCouponError('Failed to verify coupon');
            console.group("Error: ", error)
        }
    };


    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        return appliedCoupon.type === 'percentage'
            ? (subtotal * appliedCoupon.value) / 100
            : appliedCoupon.value;
    };

    const handleRemoveClick = (productId: string) => {
        setItemToRemove(productId);
    };

    const handleRemoveConfirm = () => {
        if (itemToRemove) {
            removeFromCart(itemToRemove);
            setItemToRemove(null);
        }
    };

    const [isLoading, setIsLoading] = useState(false);



    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            const token = getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...(token ? {} : { tempuser: true }),
                    cart: cartItems.map(item => ({
                        product_id: item.productId,
                        quantity: item.quantity
                    })),
                    address: shippingDetails?.address || '',
                    name: shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : '',
                    first_name: shippingDetails ? `${shippingDetails.firstName}` : '',
                    last_name: shippingDetails ? `${shippingDetails.lastName}` : '',
                    phone_number: shippingDetails?.phone || '',
                    email: shippingDetails?.email || '',
                    total_amount: totalprice,
                    payment_status: 'unpaid',
                    notes: orderNote,
                    coupon_id: appliedCoupon?.code || null,
                    pickup_location: {
                        state: selectedState,
                        city: selectedCity,
                        location: pickupLocation
                    },
                    delivery_info: {
                        fee: subtotal >= freeShippingThreshold ? 0 : deliveryFee,
                        duration: deliveryDuration
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const data = await response.json();
            console.log(data)
            clearCart();
            localStorage.removeItem('appliedCoupon');
            router.push(`/payment/${data.order_id}`);
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            alert('Failed to process order. Please try again.');
        }
    };


    const discount = calculateDiscount();
    const estimatedTotal = subtotal - discount;
    const shippingSaving = subtotal >= freeShippingThreshold ? freeShippingThreshold : 0;
    const totalSaving = discount + shippingSaving;
    const totalprice = subtotal;

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
                        <div key={item.productId} className="flex flex-col md:grid md:grid-cols-12 gap-4 py-4 items-start md:items-center border-t border-[#E0E5EB]">
                            <div className="flex gap-4 w-full md:w-auto md:col-span-5">
                                <div className="relative w-[40%] md:h-24 h-auto">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                                <div className='flex flex-col justify-center gap-2 flex-1'>
                                    <div className="flex justify-between gap-5 text-sm items-start">
                                        <h3 className="font-medium">{item.title}</h3>
                                        <span className="font-medium inline-flex md:hidden">₦{item.price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Color: <span className="text-black">{item.color}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Variation: <span className="text-black">{item.description}</span>
                                    </p>
                                    <div className="flex items-center border-2 border-[#EDF0F8] rounded-xl w-fit mt-2 md:hidden">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="px-3 py-1.5"
                                        >
                                            −
                                        </button>
                                        <span className="w-12 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
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
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        className="px-3 py-2"
                                    >
                                        −
                                    </button>
                                    <span className="w-12 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
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
                    <button
                        onClick={() => setShowPromoInput(!showPromoInput)}
                        className="w-full flex items-center justify-between py-3 px-4 bg-[#EDF0F8] rounded-xl mb-3"
                    >
                        <div className="flex gap-5">
                            <span className='font-bold flex flex-col items-center justify-center'>
                                <Percent size={15} />
                            </span>
                            <span>Apply padi code</span>
                        </div>
                        <span>{showPromoInput ? '-' : '+'}</span>
                    </button>

                    {showPromoInput && (
                        <div className="mb-3 space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Enter promo code"
                                    className="flex-1 p-3 border-2 border-[#EDF0F8] outline-0 rounded-xl"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    className="px-4 bg-[#184193] text-white rounded-xl"
                                >
                                    Apply
                                </button>
                            </div>
                            {couponError && (
                                <p className="text-red-500 text-sm">{couponError}</p>
                            )}
                            <div className="text-sm space-y-1 p-4">
                                <p className="font-medium">Available Coupons: (click to add)</p>
                                {availableCoupons.map((coupon) => (
                                    <div
                                        key={coupon.code}
                                        className="flex my-3 justify-between text-gray-600 cursor-pointer hover:text-gray-900"
                                        onClick={() => setPromoCode(coupon.code)}
                                    >
                                        <span className="font-medium">{coupon.code}</span>
                                        <span>{coupon.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#EDF0F8] rounded-xl p-6">
                        <h2 className="font-medium mb-4">Order summary</h2>
                        <div className="space-y-3 text-sm border-t py-3 border-[#E0E5EB]">
                            <div className="flex py-3 justify-between">
                                <span>Subtotal ({cartItems.length} items):</span>
                                <span>₦{subtotal.toLocaleString()}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex py-1 justify-between text-green-600">
                                    <span>Coupon ({appliedCoupon.code}):</span>
                                    <span>-₦{discount.toLocaleString()}</span>
                                </div>
                            )}
                            {shippingSaving > 0 && (
                                <div className="flex py-1 pb-3 justify-between text-gray-500">
                                    <span>Savings</span>
                                    <span className='text-red-500'>-₦{totalSaving.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex py-1 pb-6 justify-between text-gray-500">
                                <span>Shipping:</span>
                                <span className='text-black'>
                                    {selectedState ? `₦${parseInt(deliveryFee).toLocaleString()} (${deliveryDuration})` : 'Select state to calculate'}
                                </span>
                            </div>
                            <div className="flex py-1 pb-6 justify-between text-gray-500">
                                <span>Pickup Location:</span>
                                <span className='text-black'>
                                    {selectedState ? (
                                        <>
                                            {pickupLocation || 'No location selected'}
                                        </>
                                    ) : 'Select state to calculate'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 py-3 border-t border-[#E0E5EB]">
                                <label htmlFor="orderNote" className="text-gray-500">Order Note (optional):</label>
                                <textarea
                                    id="orderNote"
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    placeholder="Add any special instructions or notes for your order"
                                    className="w-full p-3 border-2 border-[#EDF0F8] bg-white outline-0 rounded-xl text-sm min-h-[100px] resize-none"
                                />
                            </div>
                            <div className="flex pt-6 justify-between border-t border-[#E0E5EB] font-medium">
                                <span>Estimated total:</span>
                                <span>₦{estimatedTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <Button
                            onClick={handlePayment}
                            rounded={true}
                            disabled={cartItems.length === 0 || isLoading}
                            className={`w-full py-3 px-4 bg-[#184193] text-white rounded-full mt-4 ${(isLoading || cartItems.length === 0)? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Processing...' : 'Proceed to payment'}
                        </Button>


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
};
