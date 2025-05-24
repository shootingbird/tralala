'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const VerifyPaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus('failed');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify/${orderId}`);
        const data = await response.json();

        if (response.ok && data.status) {
          setStatus('success');
          clearCart();
          router.push('/payment/successful');
        } else {
          setStatus('failed');
        }
      } catch (error) {
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [orderId, router]);

  return (
    <div className="container mx-auto p-4">
      {status === 'pending' && <p>Verifying payment...</p>}
      {status === 'success' && <p>Payment verified successfully!</p>}
      {status === 'failed' && <p>Payment verification failed. Please try again.</p>}
    </div>
  );
};

export default VerifyPaymentPage;