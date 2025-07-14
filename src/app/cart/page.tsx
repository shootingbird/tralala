'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Percent, X } from 'lucide-react';
import { TopBanner } from '@/components/layout/TopBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { StarIcon } from '@/components/icons/ShopIcons';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Button } from '@/components/ui/Button';
import { AuthModal } from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CouponHelper, type Coupon } from '@/lib/coupons';
import Cookies from 'js-cookie';

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
    let subtotal = 0
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const [promoCode, setPromoCode] = useState('');
    const [showPromoInput, setShowPromoInput] = useState(false);
    const [applyingCode, setapplyingCode] = useState<Boolean>(false);
    const [itemToRemove, setItemToRemove] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [checkoutType, setCheckoutType] = useState<'guest' | 'signup' | null>(null);
    const [fullTotal, setfullTotal] = useState<number>(0);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [isAuthenticated] = useState(false);

    subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingThreshold = 53000;
    const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Cart' }
    ];

    useEffect(() => {
        const referralCoupon = Cookies.get('referral_coupon');
        if (referralCoupon) {
            setPromoCode(referralCoupon);
            setShowPromoInput(true);
            Cookies.remove('referral_coupon');
        }
    }, []);

    useEffect(() => {
            if (cartItems.length > 0){
                console.log("USE EFFEC: ", subtotal)
                setfullTotal(subtotal)
            }
            console.log("FULL TOTAL: ", fullTotal, subtotal)
    }, [subtotal])

    const handleRemoveConfirm = () => {
        if (itemToRemove) {
            removeFromCart(itemToRemove);
            setItemToRemove(null);
        }
    };
    const handleAuthComplete = (isSuccessful?: boolean) => {
        setShowAuthModal(false);
        if (isSuccessful || checkoutType === 'guest') {
            router.push('/checkout');
        }
    };


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
                    console.log(error)
                    console.error('Failed to parse saved coupon');
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
                    id: verification.coupon.id,
                    code: verification.coupon.code,
                    type: verification.coupon.type as 'percentage' | 'fixed',
                    value: verification.coupon.value,
                    description: verification.coupon.description,
                    minAmount: null,
                    is_available: true
                };
                setAppliedCoupon(coupon);
                localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
                setShowPromoInput(false);
                setPromoCode('');
            }
        } catch (error) {
            console.log(error)
            setCouponError('Failed to verify coupon');
        }
    };

const applyPadiCoupon = async (padiCode: string): Promise<void> => {
    setapplyingCode(true)
  try {
    const response = await fetch(
      `https://steadfast-padi-backend.pxxl.tech/api/payment/${padiCode}/verify-padi-code`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data: ApiResponse<Coupon> = await response.json();

    if (data.success && data.statusCode == 200) {
        const discountedTotal = 0.98 * subtotal;
        subtotal = discountedTotal
        setfullTotal(subtotal)
        console.log("Subtotal: ", subtotal, discountedTotal)
    } else {
      console.log("Coupon verification failed:", data.message);
    }
  } catch (error) {
    console.error("Error verifying coupon:", error);
  } finally{
    setapplyingCode(false)
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

    const handleCheckout = () => {
        if (isAuthenticated) {
            setShowAuthModal(true);
        } else {
            setCheckoutType(null);
            setShowAuthModal(true);
        }
    };

 

    const discount = calculateDiscount();
    const estimatedTotal = subtotal - discount;

    const shippingSaving = subtotal >= freeShippingThreshold ? freeShippingThreshold : 0;
    const totalSaving = discount + shippingSaving;

    return (
        <>
            <TopBanner theme="dark" />
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl px-2 pb-3 md:px-6">
                    <Breadcrumb items={breadcrumbItems} className='pb-0  md:py-0' />
                    <h1 className="text-lg md:text-2xl font-semibold mt-2 md:mt-4">Shopping cart</h1>
                    <div className="my-4">
                        <div className="flex items-center gap-1 text-sm mb-3">
                            <span>Buy</span>
                            <span className="font-medium">₦{remainingForFreeShipping.toLocaleString()}</span>
                            <span>more to get</span>
                            <span className="font-medium">Free Shipping</span>
                        </div>
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
                                                Category: <span className="text-black">{item.category}</span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Brand: <span className="text-black">{item.brand}</span>
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

                            <Link href="/products" className="text-[#151515] font-medium text-sm block mt-6">
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
                                            className="flex-1 p-2 border-2 border-[#EDF0F8] outline-0 rounded-xl"
                                        />
                                        <button
                                            onClick={() => applyPadiCoupon(promoCode)}
                                            className={applyingCode ? "px-4 bg-[#1E1E1E] text-white rounded-xl" : "px-4 bg-[#184193] text-white rounded-xl"}
                                        >
                                            {applyingCode ? "Applying..." : "Apply"}
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
                                        <span className='text-black'>Calculated at checkout</span>
                                    </div>
                                    <div className="flex pt-6 justify-between border-t border-[#E0E5EB] font-medium">
                                        <span>Estimated total:</span>
                                        <span>₦{fullTotal.toLocaleString()}</span>
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
                {/* 
                <ProductGrid
                    title="Similar Items You Might Like"
                    products={demoProducts.slice(0, 4).map(product => ({
                        ...product,
                        images: product.image ? [product.image] : [] // Ensure images array exists
                    }))}
                    isLoading={false}
                /> */}
                <Footer />
                <ConfirmationModal
                    isOpen={!!itemToRemove}
                    onConfirm={handleRemoveConfirm}
                    onCancel={() => setItemToRemove(null)}
                    title="Remove from Cart"
                    message="Are you sure you want to remove this item from your cart? If you change your mind, you'll need to add the item again."
                />
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={handleAuthComplete}
                />
            </main >
        </>
    );
}

