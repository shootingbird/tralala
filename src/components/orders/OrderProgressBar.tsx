import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { PiNotebook, PiTruckLight, PiHandshakeLight } from "react-icons/pi";

export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "arrived"
  | "delivered";

interface OrderProgressProps {
  status?: OrderStatus; // defaults to "placed"
  className?: string;
  /**
   * Delay in ms between each stage lighting up.
   * Lower => faster animation; default 350ms
   */
  stepDelay?: number;
}

const STAGES: OrderStatus[] = [
  "placed",
  "processing",
  "shipped",
  "arrived",
  "delivered",
];

const statusIcons = [
  { Icon: PiNotebook, text: "Order Placed", activeColor: "text-[#E94B1C]" },
  { Icon: PiNotebook, text: "Processing", activeColor: "text-[#E94B1C]" },
  { Icon: PiTruckLight, text: "Shipped", activeColor: "text-[#E94B1C]" },
  { Icon: PiTruckLight, text: "Arrived", activeColor: "text-[#E94B1C]" },
  { Icon: PiHandshakeLight, text: "Delivered", activeColor: "text-green-700" },
];

const OrderProgressBar: React.FC<OrderProgressProps> = ({
  status = "placed",
  className = "",
  stepDelay = 350,
}) => {
  // defensive canonicalization (falls back to 'placed')
  const canonicalStatus: OrderStatus = STAGES.includes(status)
    ? status
    : "placed";
  const targetIndexRaw = STAGES.indexOf(canonicalStatus);
  const targetIndex = targetIndexRaw >= 0 ? targetIndexRaw : 0;

  // animated index (which stage is currently lit). Starts at -1 then animates to 0..targetIndex
  const [animatedIndex, setAnimatedIndex] = useState<number>(-1);
  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef(false);

  // compute percent from current animated index for fill width
  const percent =
    STAGES.length > 1
      ? (Math.max(0, animatedIndex) / (STAGES.length - 1)) * 100
      : 0;
  // clamp percent to 0..100
  const clampedPercent = Math.max(0, Math.min(100, percent));

  useEffect(() => {
    // clear any previous timers
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];

    // If this is first mount, animate from start -> target.
    // If component was already mounted and status changed, animate from current animatedIndex to new target.
    const startIndex = mountedRef.current ? animatedIndex : -1;
    mountedRef.current = true;

    // Build sequence of indices to set, always start from 0 for a fresh fun animation on first render.
    // If startIndex < 0 (fresh mount), we animate: -1 -> 0 -> 1 -> ... -> targetIndex
    // If startIndex >= 0 (status changed while mounted), animate from startIndex -> startIndex+1 -> ... -> targetIndex
    const from = startIndex < 0 ? 0 : startIndex + 1;
    if (targetIndex < 0) {
      setAnimatedIndex(0);
      return;
    }

    // if targetIndex is 0 and we are fresh mount, still animate to show initial dot quickly
    const steps: number[] = [];
    for (let i = from; i <= targetIndex; i++) steps.push(i);

    if (steps.length === 0) {
      // no animation needed, but ensure final index is correct
      setAnimatedIndex(targetIndex);
      return;
    }

    // schedule each step with stepDelay spacing
    steps.forEach((idx, i) => {
      const t = window.setTimeout(() => {
        setAnimatedIndex(idx);
      }, stepDelay * (i + 1));
      timersRef.current.push(t);
    });

    // cleanup on unmount or next run
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex]); // animate when targetIndex (derived from status) changes

  // Minor safeguard: if no animation ran yet, set a quick fallback so UI isn't stuck at -1
  useEffect(() => {
    if (animatedIndex === -1) {
      const t = window.setTimeout(() => setAnimatedIndex(0), 120);
      return () => clearTimeout(t);
    }
  }, [animatedIndex]);

  return (
    <div
      className={`relative w-full max-w-[1000px] m-auto -mt-20 mb-6 ${className}`}
    >
      <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-blue-100 -translate-y-1/2 z-10" />

      {/* progress fill: transition-all lets the width animate smoothly */}
      <div
        className="absolute top-1/2 left-0 h-[4px] bg-[#E94B1C] -translate-y-1/2 transition-all duration-300 z-20"
        style={{ width: `${clampedPercent}%` }}
      />

      {/* dots */}
      <div className="absolute inset-x-0 top-1/2 flex justify-between -translate-y-1/2 z-30">
        {statusIcons.map((_, idx) => {
          const isActive = idx <= animatedIndex;
          // animate-bounce-once should trigger only the moment the dot becomes active; we approximate
          const becomesActive = idx === animatedIndex;
          return (
            <div
              key={idx}
              className={`w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-[#E94B1C] transition-colors duration-300 ${
                isActive
                  ? "bg-[#E94B1C] scale-120 border-2 border-white"
                  : "bg-white"
              } ${becomesActive ? "animate-bounce-once" : ""}`}
            >
              {isActive && <Check className="w-4 h-4 text-white" />}
            </div>
          );
        })}
      </div>

      {/* icons & labels */}
      <div className="relative flex justify-between mt-10 z-0 pt-20">
        {statusIcons.map(({ Icon, text, activeColor }, idx) => {
          const isActive = idx <= animatedIndex;
          return (
            <div
              key={idx}
              className="flex flex-col items-center space-y-1 relative"
            >
              <Icon
                className={`h-6 w-6 ${
                  isActive ? activeColor : "text-gray-400"
                }`}
              />
              <span
                className={`text-[10px] mdtext-sm font-medium absolute -bottom-5 truncate ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressBar;
