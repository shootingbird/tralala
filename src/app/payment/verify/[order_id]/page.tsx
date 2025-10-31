"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/useCart";
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
  const payStackReference = searchParams.get("reference");

  // console.log(orderId);
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );

  // const requestReferralEarnings = async (
  //   accessToken: string,
  //   padiCode: string,
  //   orderId: string,
  //   total: number
  // ): Promise<boolean> => {
  //   try {

  //     if (!padiCode || !orderId || !total || !accessToken) {
  //       console.error(
  //         "Missing required parameters for referral earnings request"
  //       );
  //       return false;
  //     }

  //     console.log("Requesting referral earnings with:", {
  //       padiCode,
  //       orderId,
  //       total,
  //     });

  //     const response = await fetch(
  //       `https://steadfast-padi-backend.pxxl.tech/api/payment/${encodeURIComponent(
  //         padiCode
  //       )}/request-referral-earnings`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "x-access-key": accessToken,
  //         },
  //         body: JSON.stringify({
  //           orderId,
  //           category: "Miscellaneous", // Consider making this dynamic
  //           amount: Number(total),
  //         }),
  //       }
  //     );

  //     const data: ReferralEarningsResponse = await response.json();
  //     console.log("Referral response status:", response.status);
  //     console.log("Referral response data:", data);

  //     if (response.ok && data.success) {
  //       console.log("Referral earnings requested successfully");
  //       return true;
  //     } else {
  //       console.error("Referral earnings request failed:", {
  //         status: response.status,
  //         statusText: response.statusText,
  //         data,
  //       });
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Error requesting referral earnings:", error);
  //     return false;
  //   }
  // };

  useEffect(() => {
    const verifyPayment = async () => {
      if (!payStackReference) {
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify/${payStackReference}`
        );
        const data = await response.json();

        if (response.ok && data.status) {
          setStatus("success");
          clearCart();
          router.push("/payment/successful");
          console.log("INterestingggggg");
        } else {
          setStatus("failed");
        }

        // const padiCode =
        //   localStorage.getItem("padiCode") || Cookies.get("padiCode") || "";
        // const total = data.data.amount * 0.017;
        // console.log(
        //   "Padi Code: ",
        //   padiCode,
        //   "pay Stack Reference: ",
        //   payStackReference,
        //   "Total: ",
        //   total
        // );

        // const accessToken =
        //   "f02a115cd294dc3c05f87a8838dd27391174aed66436e92acaade9e5a1d99bf17050f24b4d2ccdca98a4e5b4f64fb0d86dea";

        // const success = await requestReferralEarnings(
        //   accessToken,
        //   padiCode,
        //   orderId,
        //   total
        // );
        //   if (success) {
        //     router.push("/successful");
        //   }
        //   else {
        //     console.warn("Referral earnings could not be requested");
        //     router.push("/successful"); // Still go forward even if referral fails
        //   }
        // }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [payStackReference, router]);

  return (
    <div className="container mx-auto p-4">
      {status === "pending" && <p>Verifying payment...</p>}
      {status === "success" && <p>Payment verified successfully!</p>}
      {status === "failed" && (
        <p>Payment verification failed. Please try again.</p>
      )}
    </div>
  );
};

export default VerifyPaymentPage;
