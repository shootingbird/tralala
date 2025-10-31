"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import AppWapper from "@/app/AppWapper";

type Order = any; // replace with a proper order type when available

export default function PaymentPage() {
  return (
    <AppWapper>
      <PaymentPageContent />
    </AppWapper>
  );
}

function PaymentPageContent() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { getToken } = useAuth();

  const params = useParams<{ orderId?: string }>();
  const orderId = params?.orderId ?? "";

  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch order when orderId changes
  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setOrderError(null);
      setLoadingOrder(false);
      setIsProcessing(false);
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    const fetchOrder = async () => {
      setLoadingOrder(true);
      setOrderError(null);

      const token = getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${encodeURIComponent(
            orderId
          )}?include_items=true`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(text || `HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!mounted) return;
        setOrder(json?.order ?? null);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Fetch order error:", err);
        if (!mounted) return;
        setOrderError(err?.message ?? "Failed to fetch order");
        setOrder(null);
      } finally {
        if (!mounted) return;
        setLoadingOrder(false);
      }
    };

    fetchOrder();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [orderId]);

  // Kick off payment flow when we have an orderId (and optionally order)
  useEffect(() => {
    if (!orderId) {
      setIsProcessing(false);
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    const processPayment = async () => {
      setIsProcessing(true);
      setError("");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/payments/init/${encodeURIComponent(orderId)}`,
          {
            method: "POST",
            headers,
            signal: controller.signal,
            body: JSON.stringify({
              pay_for_me: false,
              email: order?.contact?.email ?? null,
              callback_url: `${
                process.env.NEXT_PUBLIC_ROUTE
              }/payment/verify/${encodeURIComponent(orderId)}`,
            }),
          }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(text || `HTTP ${res.status}`);
        }

        const json = await res.json();
        const paymentUrl = json?.data?.payment_url;

        if (!paymentUrl) throw new Error("Payment URL not returned by server");

        // Clear cart, then redirect user to external payment provider
        clearCart();

        // Use full navigation to ensure third-party redirect works reliably
        window.location.href = paymentUrl;

        // If we reach here while still mounted, update state and navigate to orders page
        if (mounted) {
          setIsProcessing(false);
          // we still push to orders page in case payment provider returns to app quickly.
          // Note: in many flows the app won't reach the next line because the browser has navigated away.
          router.push(`/orders/${orderId}`);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Payment init error:", err);
        if (!mounted) return;
        setError("Failed to process payment. Please try again.");
        setIsProcessing(false);
      }
    };

    processPayment();

    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, clearCart, getToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {isProcessing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#184193] mx-auto" />
            <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
              Processing your payment...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please do not close this window
            </p>
            {loadingOrder && (
              <p className="mt-2 text-center text-sm text-gray-500">
                Loading order…
              </p>
            )}
            {orderError && (
              <p className="mt-2 text-center text-sm text-red-600">
                {orderError}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <button
              onClick={() => {
                // allow trying again by reloading the page or re-triggering the effect
                setIsProcessing(true);
                setError("");
                // simple reload so the payment effect runs again
                window.location.reload();
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
