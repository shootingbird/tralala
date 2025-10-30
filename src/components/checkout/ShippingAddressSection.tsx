"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Pen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Select from "react-select";

const STORAGE_KEY = "shipping_details";

const defaultAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  address: "",
  note: "",
};

type ShippingAddressSectionProps = {
  onStateSelect: (state: string) => void;
  onCitySelect: (city: string) => void;
  onShippingDetailsChange: (details: typeof defaultAddress) => void;
  setDisableContinue: (disabled: boolean) => void;
  zonesData?: Zone[];
  isLoadingZones?: boolean;
  onZoneSelect?: (zone: Zone | null) => void;
};

type StateOption = { value: string; label: string };
type CityOption = { value: string; label: string };

interface Zone {
  city: string;
  duration: string;
  fee: number;
  id: number;
  is_active: boolean;
  lga: string | null;
  pickups: string[];
  state: string;
}

interface ZonesResponse {
  pagination: {
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
    per_page: number;
    total: number;
    total_pages: number;
  };
  zones: Zone[];
}

export const ShippingAddressSection = ({
  onStateSelect,
  onCitySelect,
  onShippingDetailsChange,
  setDisableContinue,
  zonesData: externalZonesData,
  isLoadingZones: externalIsLoadingZones,
  onZoneSelect,
}: ShippingAddressSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(!isAuthenticated);
  const [shippingDetails, setShippingDetails] = useState(defaultAddress);
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zonesData, setZonesData] = useState<Zone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [states, setStates] = useState<StateOption[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Use external data if provided, otherwise use internal state
  const currentZonesData = externalZonesData || zonesData;

  const stateOptions = states;

  useEffect(() => {
    fetchZones();
    fetchStates();
  }, []);

  useEffect(() => {
    const savedDetails = localStorage.getItem(STORAGE_KEY);
    if (savedDetails) {
      const parsedDetails = JSON.parse(savedDetails);
      const detailsWithNote = { ...defaultAddress, ...parsedDetails };
      setShippingDetails(detailsWithNote);
      onShippingDetailsChange(detailsWithNote);

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
        note: "",
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
  }, [user, onStateSelect, zonesData]);

  // Fetch zone details by ID when state and city are selected
  useEffect(() => {
    const fetchZoneById = async () => {
      if (!selectedState || !selectedCity) return;

      const zone = currentZonesData.find(
        (z) => z.state === selectedState.label && z.city === selectedCity.value
      );

      if (zone?.id) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/zones/${zone.id}`
          );
          if (response.ok) {
            const data = await response.json();
            const fetchedZone = data.zone;
            setSelectedZone(fetchedZone);
            onZoneSelect?.(fetchedZone);
          }
        } catch (error) {
          console.error("Failed to fetch zone details:", error);
        }
      }
    };

    fetchZoneById();
  }, [selectedState, selectedCity, currentZonesData, onZoneSelect]);

  const updateShippingDetails = (newDetails: typeof shippingDetails) => {
    setShippingDetails(newDetails);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDetails));
    onShippingDetailsChange(newDetails);
  };

  const fetchZones = async () => {
    setIsLoadingZones(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/zones?active=true&page=1&per_page=200`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch zones");
      }
      const data: ZonesResponse = await response.json();
      setZonesData(data.zones);
    } catch (error) {
      console.error("Error fetching zones:", error);
    } finally {
      setIsLoadingZones(false);
    }
  };

  const fetchStates = async () => {
    setIsLoadingStates(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/states`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }
      const data = await response.json();
      const stateOptions = data.states.map(
        (state: { alias: string; name: string }) => ({
          value: state.alias,
          label: state.name,
        })
      );
      setStates(stateOptions);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const fetchCities = async (stateName: string) => {
    setIsLoadingCities(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delivery/cities/${stateName}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }
      const data = await response.json();
      const cityOptions = data.lgas.map((city: string) => ({
        value: city,
        label: city,
      }));
      setAvailableCities(cityOptions);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const updateCities = (stateName: string) => {
    const citiesForState = currentZonesData
      .filter((zone) => zone.state === stateName)
      .map((zone) => zone.city);
    const uniqueCities = Array.from(new Set(citiesForState));
    setAvailableCities(
      uniqueCities.map((city) => ({ value: city, label: city }))
    );
  };

  const normalizeName = (value: string) => {
    if (!value) return "";
    return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
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
    updateShippingDetails({ ...shippingDetails, [field]: value });
    validateField(field, value);
  };

  const handleBlur = (field: keyof typeof shippingDetails) => {
    if (field === "firstName" || field === "lastName") {
      const currentValue = shippingDetails[field];
      const normalized = normalizeName(currentValue);
      if (normalized !== currentValue) {
        updateShippingDetails({ ...shippingDetails, [field]: normalized });
        validateField(field, normalized);
      }
    }
  };

  const handleStateChange = (option: StateOption | null) => {
    setSelectedState(option);
    setSelectedCity(null);
    setSelectedZone(null);
    const newDetails = {
      ...shippingDetails,
      state: option?.label || "",
      city: "",
    };
    updateShippingDetails(newDetails);
    validateField("state", option?.label || "");
    onStateSelect(option?.label || "");
    if (option) {
      fetchCities(option.value);
      // Find the first zone for this state and notify parent
      const stateZone = currentZonesData.find(
        (zone) => zone.state === option.label
      );
      if (stateZone) {
        setSelectedZone(stateZone);
        onZoneSelect?.(stateZone);
      }
    } else {
      setAvailableCities([]);
      onZoneSelect?.(null);
    }
  };

  const handleCityChange = (option: CityOption | null) => {
    setSelectedCity(option);
    const newDetails = { ...shippingDetails, city: option?.value || "" };
    updateShippingDetails(newDetails);
    validateField("city", option?.value || "");
    onCitySelect(option?.value || "");

    // Find and set the specific zone for the selected city
    if (option && selectedState) {
      const cityZone = currentZonesData.find(
        (zone) =>
          zone.state === selectedState.label && zone.city === option.value
      );
      if (cityZone) {
        setSelectedZone(cityZone);
        onZoneSelect?.(cityZone);
      }
    } else {
      setSelectedZone(null);
      onZoneSelect?.(null);
    }
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
                onBlur={() => handleBlur("firstName")}
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
                onBlur={() => handleBlur("lastName")}
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
                placeholder={
                  isLoadingStates ? "Loading states..." : "Select State"
                }
                isDisabled={isLoadingStates}
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
                placeholder={
                  !selectedState
                    ? "Select state first"
                    : isLoadingCities
                    ? "Loading cities..."
                    : "Select City"
                }
                isDisabled={!selectedState || isLoadingCities}
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

          <div>
            <Input
              label="Note (Optional)"
              value={shippingDetails.note}
              onChange={(e) => handleChange("note", e.target.value)}
            />
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
          {shippingDetails.note && (
            <div className="bg-[#18419310] col-span-1 md:col-span-2 py-2 px-5 rounded-lg">
              <label className="block text-sm text-gray-500 mb-1">Note</label>
              <p className="text-gray-900">{shippingDetails.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
