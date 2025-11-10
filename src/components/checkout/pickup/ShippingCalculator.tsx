"use client";

type ShippingCalculatorProps = {
  loading: boolean;
  error: string | null;
  duration?: string;
  fee?: string;
};

export const ShippingCalculator = ({ loading, error, duration, fee }: ShippingCalculatorProps) => {
  return (
    <div className="pt-8 border-t border-[#E5E7EB]">
      <h3 className="text-lg text-center font-semibold mb-6">Shipping Calculator</h3>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded-md w-full" />
          <div className="h-6 bg-gray-200 rounded-md w-3/4" />
          <div className="h-6 bg-gray-200 rounded-md w-1/2" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-4 text-sm transition-opacity duration-500">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Expected Delivery Timeframe</span>
            <span className="font-medium">{duration || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Shipping Fee</span>
            <span className="font-medium">NGN {fee || "-"}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-[#E5E7EB]">
            <span className="font-medium">Estimated total:</span>
            <span className="text-base font-semibold">NGN {fee || "-"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;


