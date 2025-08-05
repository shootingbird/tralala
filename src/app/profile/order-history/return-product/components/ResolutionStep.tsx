import { Button } from "@/components/ui/Button";
import React, { useState } from "react";

const preferredResolutions = [
  {
    title: "Return and Refund",
    description:
      "Get a full refund once your returned item is received and approved.",
    value: "refund",
  },
  {
    title: "Return and Exchange",
    description:
      "Swap the item for a new one of the same type after your return is confirmed.",
    value: "exchange",
  },
];

type ReasonStepProps = {
  onClickNext: () => void;
};

const ResolutionStep: React.FC<ReasonStepProps> = ({ onClickNext }) => {
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="flex flex-col gap-6">
      <p className="font-medium text-lg md:text-xl text-gray-700">
        3. Select the preferred resolution
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        {preferredResolutions.map((option) => (
          <label
            key={option.value}
            htmlFor={option.value}
            className={`flex items-start gap-5 p-4 border rounded-lg transition-all cursor-pointer focus-within:ring-2 shadow-sm`}
          >
            {/* Custom Large Radio */}
            <div className="relative">
              <input
                type="radio"
                name="resolution"
                id={option.value}
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
                className="peer appearance-none w-10 h-10 rounded-full   checked:bg-[#DEDEFA]  transition-colors shadow-[0_0_0_4px_#EFEFFD] ring-none outline-none
"
              />
            </div>

            {/* Label Text */}
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-700">
                {option.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mt-2">
                {option.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="max-w-30">
          Cancel
        </Button>
        <Button className="max-w-30" onClick={onClickNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default ResolutionStep;
