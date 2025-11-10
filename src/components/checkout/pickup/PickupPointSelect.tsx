"use client";

import Select from "react-select";

type PickupOption = {
  value: string;
  label: string;
};

type PickupPointSelectProps = {
  selectedState: string;
  loading: boolean;
  error: string | null;
  options: PickupOption[];
  value: PickupOption | null;
  onChange: (value: PickupOption | null) => void;
};

export const PickupPointSelect = ({
  selectedState,
  loading,
  error,
  options,
  value,
  onChange,
}: PickupPointSelectProps) => {
  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-12 rounded-md bg-gray-200" />
      <div className="h-6 rounded-md bg-gray-200 w-2/3" />
      <div className="h-6 rounded-md bg-gray-200 w-1/3" />
    </div>
  );

  return (
    <div>
      <h3 className="px-2 md:text-lg mb-2 md:mb-4">{selectedState}</h3>

      {loading ? (
        <div aria-live="polite">{renderSkeleton()}</div>
      ) : error ? (
        <div className="text-center text-sm text-red-600">{error}</div>
      ) : (
        <div
          className={`transition-opacity duration-500 ease-out ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        >
          <Select
            value={value}
            onChange={onChange}
            options={options}
            placeholder={options.length ? "Select your pick up point" : "No pickups available"}
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
            isDisabled={options.length === 0}
            aria-label="Pickup point select"
          />
        </div>
      )}
    </div>
  );
};

export default PickupPointSelect;


