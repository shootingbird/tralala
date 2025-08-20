"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Pen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Select from "react-select";
import statesAndCities from "@/data/states-and-cities.json";

const STORAGE_KEY = "shipping_details";

type ShippingAddressSectionProps = {
  onStateSelect: (state: string) => void;
  onCitySelect: (city: string) => void;
  onShippingDetailsChange: (details: typeof defaultAddress) => void;
};

const defaultAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  address: "",
};

type StateOption = {
  value: string;
  label: string;
};

type CityOption = {
  value: string;
  label: string;
};

export const ShippingAddressSection = ({
  onStateSelect,
  onCitySelect,
  onShippingDetailsChange,
}: ShippingAddressSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(!isAuthenticated);
  const [shippingDetails, setShippingDetails] = useState(defaultAddress);
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);

  const stateOptions: StateOption[] = statesAndCities.map((state) => ({
    value: state.name,
    label: state.name,
  }));

  useEffect(() => {
    const savedDetails = localStorage.getItem(STORAGE_KEY);
    if (savedDetails) {
      const parsedDetails = JSON.parse(savedDetails);
      onShippingDetailsChange(parsedDetails);
      setShippingDetails(parsedDetails);
      if (parsedDetails.state) {
        const stateOption = {
          value: parsedDetails.state,
          label: parsedDetails.state,
        };
        setSelectedState(stateOption);
        updateCities(parsedDetails.state);
        onStateSelect(parsedDetails.state);
      }
      if (parsedDetails.city) {
        setSelectedCity({
          value: parsedDetails.city,
          label: parsedDetails.city,
        });
      }
    } else if (user) {
      const userDetails = {
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone_number || "",
        city: user.city || "",
        state: user.state || "",
        address: user.address || "",
      };
      setShippingDetails(userDetails);
      onShippingDetailsChange(userDetails);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userDetails));

      if (user.state) {
        const stateOption = { value: user.state, label: user.state };
        setSelectedState(stateOption);
        updateCities(user.state);
        onStateSelect(user.state);
      }
      if (user.city) {
        setSelectedCity({ value: user.city, label: user.city });
      }
    }
  }, [user, onStateSelect]);

  const updateShippingDetails = (newDetails: typeof shippingDetails) => {
    setShippingDetails(newDetails);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDetails));
    onShippingDetailsChange(newDetails);
  };
  const updateCities = (stateName: string) => {
    const selectedStateData = statesAndCities.find(
      (state) => state.name === stateName
    );
    if (selectedStateData) {
      const cityOptions = selectedStateData.cities.map((city) => ({
        value: city,
        label: city,
      }));
      setAvailableCities(cityOptions);
    } else {
      setAvailableCities([]);
    }
  };

  const handleStateChange = (option: StateOption | null) => {
    setSelectedState(option);
    setSelectedCity(null);
    const newDetails = {
      ...shippingDetails,
      state: option?.value || "",
      city: "",
    };
    updateShippingDetails(newDetails);
    onStateSelect(option?.value || "");
    if (option) {
      updateCities(option.value);
    } else {
      setAvailableCities([]);
    }
  };

  const handleCityChange = (option: CityOption | null) => {
    setSelectedCity(option);
    const newDetails = { ...shippingDetails, city: option?.value || "" };
    updateShippingDetails(newDetails);
    onCitySelect(option?.value || "");
  };

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-6 px-2 md:px-0">
        <h2 className="text-lg font-semibold">Shipping Address</h2>
        {isAuthenticated && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[#184193] flex items-center text-sm"
          >
            <Pen size={14} className="mr-1" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="p-2 md:p-0">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={shippingDetails.firstName}
                onChange={(e) =>
                  updateShippingDetails({
                    ...shippingDetails,
                    firstName: e.target.value,
                  })
                }
              />
              <Input
                label="Last Name"
                value={shippingDetails.lastName}
                onChange={(e) =>
                  updateShippingDetails({
                    ...shippingDetails,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={shippingDetails.email}
                onChange={(e) =>
                  updateShippingDetails({
                    ...shippingDetails,
                    email: e.target.value,
                  })
                }
              />
              <Input
                label="Mobile Number"
                type="tel"
                value={shippingDetails.phone}
                onChange={(e) =>
                  updateShippingDetails({
                    ...shippingDetails,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Select
                  value={selectedState}
                  onChange={handleStateChange}
                  options={stateOptions}
                  isClearable
                  isSearchable
                  placeholder="Select State"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Select
                  value={selectedCity}
                  onChange={handleCityChange}
                  options={availableCities}
                  isClearable
                  isSearchable
                  placeholder="Select City"
                  isDisabled={!selectedState}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
            <Input
              label="Apartment Number and Street Address"
              value={shippingDetails.address}
              onChange={(e) =>
                updateShippingDetails({
                  ...shippingDetails,
                  address: e.target.value,
                })
              }
            />
          </form>
        </div>
      ) : (
        <div className="p-2 md:p-0 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#18419310] py-2 px-5 rounded-lg">
            <label className="block text-sm text-gray-500 mb-1">
              First Name
            </label>
            <p className="text-gray-900">{shippingDetails.firstName}</p>
          </div>
          <div className="bg-[#18419310] py-2 px-5 rounded-lg">
            <label className="block text-sm text-gray-500 mb-1">
              Last Name
            </label>
            <p className="text-gray-900">{shippingDetails.lastName}</p>
          </div>
          <div className="bg-[#18419310] py-2 px-5 rounded-lg">
            <label className="block text-sm text-gray-500 mb-1">
              Email Address
            </label>
            <p className="text-gray-900">{shippingDetails.email}</p>
          </div>
          <div className="bg-[#18419310] py-2 px-5 rounded-lg">
            <label className="block text-sm text-gray-500 mb-1">
              Mobile Number
            </label>
            <p className="text-gray-900">{shippingDetails.phone}</p>
          </div>
          <div className="bg-[#18419310] py-2 px-5 rounded-lg">
            <label className="block text-sm text-gray-500 mb-1">State</label>
            <p className="text-gray-900">{shippingDetails.state}</p>
          </div>
          <div className="bg-[#18419310] py-2 px-5 rounded-lg">
            <label className="block text-sm text-gray-500 mb-1">City</label>
            <p className="text-gray-900">{shippingDetails.city}</p>
          </div>
          <div className="bg-[#18419310] col-span-1 md:col-span-2 py-2 px-5 rounded-lg">
            <label className="block text-sm text-gray-500 mb-1">Address</label>
            <p className="text-gray-900">{shippingDetails.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};
