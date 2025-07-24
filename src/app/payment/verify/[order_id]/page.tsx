'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const VerifyPaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
        const requestReferralEarnings = async (
        accessToken: string,
        padiCode: string,
        orderId: string,
        total: number
    ) => {
        try {
        const response = await fetch(`https://steadfast-padi-backend.pxxl.tech/api/payment/${padiCode}/request-referral-earnings`, {
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
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Referral earnings requested successfully:", data);
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
        const authenticateAdmin = async (
        padiCode: string,
        orderId: string,
        total: number
    ): Promise<void> => {
        try {
        const response = await fetch("https://steadfast-padi-backend.pxxl.tech/api/admin-auth/login", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            email: "dev@steadfast.com",
            password: "qwerty12345",
            }),
        });

        const data = await response.json();

        if (response.ok && data.status && data.data.accessToken) {
            console.log("Admin authenticated successfully");
            const accessToken = data.data.accessToken;

            await requestReferralEarnings(accessToken, padiCode, orderId, total);
        } else {
            console.error("Admin authentication failed:", data);
        }
        } catch (error) {
        console.error("Error authenticating admin:", error);
        }
    };
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
          const padiCode = localStorage.getItem("padiCode");
          const padiTry = Cookies.get("padiCode");

          const code = padiCode || padiTry;
          const total = data.data.amount

          if (code && orderId && total) {
                console.log("Sharp");
                await authenticateAdmin(code, orderId, total);
            }
          router.push('/successful');
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