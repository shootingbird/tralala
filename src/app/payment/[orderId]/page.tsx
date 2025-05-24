'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/context/CartContext';

export default function PaymentPage() {
    const router = useRouter();
    const {clearCart} = useCart();
    const { getToken } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState('');
    const [paymentReference, setPaymentReference] = useState('')
    const params = useParams<{ orderId: string }>()
    const orderId = params.orderId;

    useEffect(() => {
        const processPayment = async () => {
          try {
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            }
            const token = getToken()
            if (token) {
              headers["Authorization"] = `Bearer ${token}`
            }
    
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/generate`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                order_id: orderId,
              }),
            })
    
            if (!response.ok) {
              throw new Error("Payment processing failed")
            }
    
            const data = await response.json()
            console.log("Data: ", data)
            console.log("Redirecting to: ", `/orders/${orderId}`)
            clearCart()
            window.location.href = data.data.payment_url
          } catch (error) {
            console.log("Error: ", error)
            setError("Failed to process payment. Please try again.")
            // setIsProcessing(false)
          }
        }
    
        if (orderId) {
          processPayment()
        }
      }, [orderId, router, clearCart, getToken])

      useEffect(() => {
        const verifyPayment = async (reference: string) => {
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`
                };

                const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                    method: 'GET',
                    headers
                });

                const data = await response.json();

                if (response.ok && data.status && data.data.status === 'success') {
                    // Handle successful verification
                    console.log('Payment verified successfully:', data);
                    clearCart();
                    router.push(`/orders/${paymentReference}`);
                    setTimeout(() => {
                        setPaymentReference("")
                    }, 5000)
                } else {
                    console.error('Payment verification failed:', data);
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
            }
        };

        if (paymentReference !== "") {
            verifyPayment(paymentReference);
        }
    }, [paymentReference]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {isProcessing ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#184193] mx-auto"></div>
                        <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
                            Processing your payment...
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Please do not close this window
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="text-red-600 mb-4">{error}</div>
                        <button
                            onClick={() => {
                                setIsProcessing(true);
                                setError('Payment processing failed');
                            }}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#184193] hover:bg-[#123472] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#184193]"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}