import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PiNotebook, PiTruckLight, PiHandshakeLight } from "react-icons/pi";

interface ReturnProgressProps {
  returnStatus: "order" | "reason" | "resolution" | "confirmation";
  className?: string;
}

const ReturnProgressBar: React.FC<ReturnProgressProps> = ({
  returnStatus,
  className = "",
}) => {
  const statuses: ReturnProgressProps["returnStatus"][] = [
    "order",
    "reason",
    "resolution",
    "confirmation",
  ];
  const statusIcons = [
    { Icon: PiNotebook, text: "Order History", activeColor: "text-[#184193]" },
    { Icon: PiNotebook, text: "Return Reason", activeColor: "text-[#184193]" },
    {
      Icon: PiTruckLight,
      text: "Preferred resolution",
      activeColor: "text-[#184193]",
    },
    {
      Icon: PiHandshakeLight,
      text: "Confirmation",
      activeColor: "text-green-700",
    },
  ];

  const currentIndex = statuses.indexOf(returnStatus);
  const percent =
    statuses.length > 1 ? (currentIndex / (statuses.length - 1)) * 100 : 0;

  const [animateIndex, setAnimateIndex] = useState<number | null>(null);

  useEffect(() => {
    setAnimateIndex(currentIndex);

    const timeout = setTimeout(() => {
      setAnimateIndex(null);
    }, 600); // match animation duration

    return () => clearTimeout(timeout);
  }, [returnStatus]);

  return (
    <div
      className={`relative w-full max-w-[1000px] m-auto -mt-20 mb-6 ${className}`}
    >
      <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-blue-100 -translate-y-1/2 z-10" />
      <div
        className="absolute top-1/2 left-0 h-[4px] bg-[#184193] -translate-y-1/2 transition-width duration-300 z-20"
        style={{ width: `${percent}%` }}
      />
      <div className="absolute inset-x-0 top-1/2 flex justify-between -translate-y-1/2 z-30">
        {statuses.map((_, idx) => {
          const isActive = idx <= currentIndex;
          const shouldAnimate = idx === animateIndex;

          return (
            <div
              key={idx}
              className={`w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-[#184193] transition-colors duration-300 ${
                isActive
                  ? "bg-[#184193] scale-120 border-2 border-white"
                  : "bg-white"
              } ${shouldAnimate ? "animate-bounce-once" : ""}`}
            >
              {isActive && <Check className="w-4 h-4 text-white" />}
            </div>
          );
        })}
      </div>

      <div className="relative flex justify-between mt-10 z-0 pt-20">
        {statusIcons.map(({ Icon, text, activeColor }, idx) => {
          const isActive = idx <= currentIndex;
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

export default ReturnProgressBar;
