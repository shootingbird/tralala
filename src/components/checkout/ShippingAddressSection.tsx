"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Pen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Select from "react-select";
import statesAndCities from "@/data/states-and-cities.json";

const STORAGE_KEY = "shipping_details";

const defaultAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  address: "",
};

type ShippingAddressSectionProps = {
  onStateSelect: (state: string) => void;
  onCitySelect: (city: string) => void;
  onShippingDetailsChange: (details: typeof defaultAddress) => void;
  setDisableContinue: (disabled: boolean) => void;
};

type StateOption = { value: string; label: string };
type CityOption = { value: string; label: string };

export const ShippingAddressSection = ({
  onStateSelect,
  onCitySelect,
  onShippingDetailsChange,
  setDisableContinue,
}: ShippingAddressSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(!isAuthenticated);
  const [shippingDetails, setShippingDetails] = useState(defaultAddress);
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stateOptions: StateOption[] = statesAndCities.map((state) => ({
    value: state.name,
    label: state.name,
  }));

  useEffect(() => {
    const savedDetails = localStorage.getItem(STORAGE_KEY);
    if (savedDetails) {
      const parsedDetails = JSON.parse(savedDetails);
      setShippingDetails(parsedDetails);
      onShippingDetailsChange(parsedDetails);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setAvailableCities(
        selectedStateData.cities.map((city) => ({ value: city, label: city }))
      );
    } else {
      setAvailableCities([]);
    }
  };

  const normalizeName = (value: string) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) error = "Required";
        break;
      case "email":
        if (!value) error = "Required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email";
        break;
      case "phone":
        if (!value) error = "Required";
        else if (!/^\d{11}$/.test(value)) {
          error = "Phone number must be exactly 11 digits (e.g. 08012345678)";
        }
        break;
      case "address":
        if (!value.trim()) error = "Required";
        break;
      case "state":
        if (!value) error = "Required";
        break;
      case "city":
        if (!value) error = "Required";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  // Check overall validity without mutating errors object (used to control the parent button)
  const isFormValid = () => {
    const { firstName, lastName, email, phone, address, state, city } =
      shippingDetails;

    if (!firstName || !firstName.trim()) return false;
    if (!lastName || !lastName.trim()) return false;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (!phone || !/^\d{11}$/.test(phone)) return false;
    if (!address || !address.trim()) return false;
    if (!state || !state.trim()) return false;
    if (!city || !city.trim()) return false;

    return true;
  };

  // Whenever shipping details change, update parent's disable flag
  useEffect(() => {
    const valid = isFormValid();
    // if form is valid => disableContinue = false
    setDisableContinue(!valid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingDetails, selectedState, selectedCity, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = Object.entries(shippingDetails).every(([key, value]) =>
      validateField(key, value as string)
    );
    if (!isValid) {
      console.log("Form invalid", errors);
      return;
    }
    console.log("Form valid → shipping details saved", shippingDetails);
    setIsEditing(false);
  };

  const handleChange = (field: keyof typeof shippingDetails, value: string) => {
    let newValue = value;

    if (field === "firstName" || field === "lastName") {
      newValue = normalizeName(value);
    }

    updateShippingDetails({ ...shippingDetails, [field]: newValue });
    validateField(field, newValue);
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
    validateField("state", option?.value || "");
    onStateSelect(option?.value || "");
    if (option) updateCities(option.value);
    else setAvailableCities([]);
  };

  const handleCityChange = (option: CityOption | null) => {
    setSelectedCity(option);
    const newDetails = { ...shippingDetails, city: option?.value || "" };
    updateShippingDetails(newDetails);
    validateField("city", option?.value || "");
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
            <Pen size={14} className="mr-1" /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="space-y-4 p-2 md:p-0" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                value={shippingDetails.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Input
                label="Last Name"
                value={shippingDetails.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Email Address"
                type="email"
                value={shippingDetails.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>
            <div>
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="08012345678"
                value={shippingDetails.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>
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
              {errors.state && (
                <p className="text-red-500 text-xs">{errors.state}</p>
              )}
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
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              label="Apartment Number and Street Address"
              value={shippingDetails.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-[#184193] text-white px-4 py-2 rounded-md mt-4"
          >
            Save Address
          </button>
        </form>
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
