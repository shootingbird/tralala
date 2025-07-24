'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
type AdminAuthResponse = {
  success: boolean;
  data: {
    accessToken: string;
  };
  message?: string;
};

type ReferralEarningsResponse = {
  success: boolean;
  message?: string;
};


const VerifyPaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');



const requestReferralEarnings = async (
  accessToken: string,
  padiCode: string,
  orderId: string,
  total: number
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://steadfast-padi-backend.pxxl.tech/api/payment/${padiCode}/request-referral-earnings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-key": accessToken,
        },
        body: JSON.stringify({
          orderId,
          category: "POP/Surface Light",
          amount: total,
        }),
      }
    );

    const data: ReferralEarningsResponse = await response.json();
    console.log("Referral response: ", data);

    if (response.ok && data.success) {
      console.log("Referral earnings requested successfully");
      return true;
    } else {
      console.error("Referral earnings request failed:", data);
      return false;
    }
  } catch (error) {
    console.error("Error requesting referral earnings:", error);
    return false;
  }
};

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

        const padiCode = localStorage.getItem("padiCode") || Cookies.get("padiCode") || '';
        const total = data.data.amount;

        const accessToken = "6ba2ef40d8dc5eca6e40661436b38d909b04409f5fae6399dc1cfa784f4830b77466502c0d3b8db6e60ad44a3b3fea137d2ed782bac448577bb788814ab929f51f6ad71e691569717f5df786348d7c04";

        const success = await requestReferralEarnings(accessToken, padiCode, orderId, total);
        if (success) {
          router.push('/successful');
        } else {
          console.warn('Referral earnings could not be requested');
          router.push('/successful'); // Still go forward even if referral fails
        }
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error("Payment verification error:", error);
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