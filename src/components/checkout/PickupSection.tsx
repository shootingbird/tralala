"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

type PickupSectionProps = {
  selectedState: string;
  onPickupSelect: (pickupData: SelectedPickup) => void;
  // NOW: parent expects the full zone object (or null)
  onDeliveryInfoChange: (zone: ApiZone | null) => void;
  selectedZone?: ApiZone | null;
};

type PickupOption = {
  value: string;
  label: string;
};

type StoredPickupData = {
  state: string;
  pickup: string | PickupOption;
};

export type ApiZone = {
  id?: number;
  state: string;
  city?: string;
  fee: number | string;
  duration: string;
  pickups?: string[];
  pickup_point?: string;
  is_active?: boolean;
  lga?: string;
  created_at?: string;
  updated_at?: string;
  // any extra fields the API returns
  [key: string]: unknown;
};

export type SelectedPickup = {
  pickup: string | PickupOption | null;
  fee: string;
  duration: string;
  zone?: ApiZone | null;
};

const STORAGE_KEY = "pickup_details";

export const PickupSection = ({
  selectedState,
  onPickupSelect,
  onDeliveryInfoChange,
  selectedZone,
}: PickupSectionProps) => {
  const [deliveryInfo, setDeliveryInfo] = useState<{
    fee: string;
    duration: string;
    pickups: string[];
  } | null>(null);

  const [currentZone, setCurrentZone] = useState<ApiZone | null>(null);
  const [selectedPickupPoint, setSelectedPickupPoint] =
    useState<PickupOption | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<ApiZone[]>([]);

  const isLagos = selectedState?.toUpperCase() === "LAGOS";

  // Fetch zone details using selectedZone if available, otherwise use state query
  useEffect(() => {
    const controller = new AbortController();

    const fetchDeliveryInfo = async () => {
      if (!selectedZone && !selectedState) {
        setDeliveryInfo(null);
        setCurrentZone(null);
        setError(null);
        onDeliveryInfoChange(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let zones: ApiZone[];

        if (selectedZone) {
          // Use the selectedZone directly (already fetched in ShippingAddressSection)
          zones = [selectedZone];
        } else {
          // Check if API URL is defined
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) {
            console.error(
              "NEXT_PUBLIC_API_URL is not defined in environment variables"
            );
            setError("API configuration error. Please contact support.");
            setLoading(false);
            return;
          }

          // Use new zones endpoint with state parameter
          const url = `${apiUrl}/api/delivery/zones?state=${encodeURIComponent(
            selectedState
          )}&active=1&page=1&per_page=20`;

          const res = await fetch(url, { signal: controller.signal });

          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

          const data = await res.json();

          // Response format: { "zones": [...] }
          if (data?.zones?.length > 0) {
            zones = data.zones;
            setZones(zones);
          } else {
            throw new Error(
              "No delivery info available for the selected state."
            );
          }
        }

        // Extract pickup points from zones
        const pickupPoints: string[] = zones
          .map(
            (zone) => zone.pickup_point || (zone.pickups ? zone.pickups : [])
          )
          .filter((point): point is string | string[] => Boolean(point))
          .flat()
          .filter((point): point is string => typeof point === "string");

        // Use the selectedZone if available, otherwise the first zone
        const zoneToUse = selectedZone || zones[0];
        const normalized = {
          fee: String(zoneToUse.fee ?? 0),
          duration: zoneToUse.duration ?? "",
          pickups: pickupPoints,
        };

        // store both normalized values for the UI and the full zones for parent
        setDeliveryInfo(normalized);
        setCurrentZone(zoneToUse);

        // Notify parent with full zone immediately (so they have access)
        onDeliveryInfoChange(zoneToUse);

        // Auto-select if only one pickup option
        if (normalized.pickups.length === 1) {
          const autoPickup = {
            value: normalized.pickups[0],
            label: normalized.pickups[0],
          };
          setSelectedPickupPoint(autoPickup);
          onPickupSelect({
            pickup: autoPickup,
            fee: normalized.fee,
            duration: normalized.duration,
            zone: zoneToUse,
          });
        } else {
          // Clear previous pickup selection while we may restore from storage next
          setSelectedPickupPoint(null);
          onPickupSelect({
            pickup: null,
            fee: normalized.fee,
            duration: normalized.duration,
            zone: zoneToUse,
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Error fetching delivery info", err);
        setDeliveryInfo(null);
        setCurrentZone(null);
        setError("Unable to load delivery information. Please try again.");
        onDeliveryInfoChange(null);
        onPickupSelect({ pickup: null, fee: "0", duration: "", zone: null });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryInfo();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone, selectedState]);

  // Removed Lagos special handling

  // Restore saved pickup from localStorage once deliveryInfo/currentZone available
  useEffect(() => {
    if (!deliveryInfo || !currentZone) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed: StoredPickupData = JSON.parse(saved);
      if (parsed.state !== selectedState) return;

      if (isLagos) {
        // For Lagos, always set to "Home Delivery"
        onPickupSelect({
          pickup: "Home Delivery",
          fee: deliveryInfo.fee,
          duration: deliveryInfo.duration,
          zone: currentZone,
        });
        onDeliveryInfoChange(currentZone);
      } else {
        let option: PickupOption | null = null;
        if (typeof parsed.pickup === "string") {
          const found = deliveryInfo.pickups.find((p) => p === parsed.pickup);
          if (found) option = { value: found, label: found };
        } else {
          const obj = parsed.pickup as PickupOption;
          const found = deliveryInfo.pickups.find((p) => p === obj.value);
          if (found) option = { value: found, label: found };
        }

        if (option) {
          setSelectedPickupPoint(option);
          onPickupSelect({
            pickup: option,
            fee: deliveryInfo.fee || "0",
            duration: deliveryInfo.duration,
            zone: currentZone,
          });
          onDeliveryInfoChange(currentZone);
        } else {
          // mismatch => clear saved selection
          setSelectedPickupPoint(null);
          localStorage.removeItem(STORAGE_KEY);
          onPickupSelect({
            pickup: null,
            fee: deliveryInfo.fee || "0",
            duration: deliveryInfo.duration,
            zone: currentZone,
          });
          onDeliveryInfoChange(currentZone);
        }
      }
    } catch (err) {
      console.warn("Failed to parse pickup storage", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryInfo, currentZone, selectedState]);

  const pickupOptions: PickupOption[] = (deliveryInfo?.pickups || []).map(
    (p) => ({ value: p, label: p })
  );

  const persistPickup = (pickup: string | PickupOption | null) => {
    if (!selectedState) return;
    if (!pickup) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload: StoredPickupData = {
      state: selectedState,
      pickup: typeof pickup === "string" ? pickup : pickup,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  // When user picks from dropdown, include the full zone in onPickupSelect and update parent delivery info
  const handlePickupChange = (value: PickupOption | null) => {
    console.log(value);
    setSelectedPickupPoint(value);
    if (value) {
      persistPickup(value);
      // Find the zone that contains this pickup point
      const selectedZoneForPickup =
        zones.find(
          (zone) =>
            zone.pickup_point === value.value ||
            (zone.pickups && zone.pickups.includes(value.value))
        ) || currentZone;

      onPickupSelect({
        pickup: value,
        fee: String(selectedZoneForPickup?.fee ?? 0),
        duration: selectedZoneForPickup?.duration ?? "",
        zone: selectedZoneForPickup ?? null,
      });
      // ensure parent has the full zone object (requested)
      onDeliveryInfoChange(selectedZoneForPickup);
    } else {
      persistPickup(null);
      onPickupSelect({
        pickup: null,
        fee: "0",
        duration: "",
        zone: currentZone ?? null,
      });
      onDeliveryInfoChange(currentZone);
    }
  };

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-12 rounded-md bg-gray-200" />
      <div className="h-6 rounded-md bg-gray-200 w-2/3" />
      <div className="h-6 rounded-md bg-gray-200 w-1/3" />
    </div>
  );

  return (
    <div className="bg-white max-w-xl mx-auto">
      <h2 className="md:text-lg text-center font-semibold mb-8">
        Pick Up Point
      </h2>

      <div className="space-y-8">
        {selectedState ? (
          <div>
            <h3 className="px-2 md:text-lg mb-2 md:mb-4">{selectedState}</h3>

            {loading ? (
              <div aria-live="polite">{renderSkeleton()}</div>
            ) : error ? (
              <div className="text-center text-sm text-red-600">{error}</div>
            ) : deliveryInfo ? (
              <div
                className={`transition-opacity duration-500 ease-out ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              >
                {/* {isLagos ? (
                  <Select
                    value={{ value: "Home Delivery", label: "Home Delivery" }}
                    options={[
                      { value: "Home Delivery", label: "Home Delivery" },
                    ]}
                    placeholder="Select pickup point"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isDisabled
                    aria-label="Lagos pickup point"
                  />
                ) : ( */}
                <Select
                  value={selectedPickupPoint}
                  onChange={handlePickupChange}
                  options={pickupOptions}
                  placeholder={
                    pickupOptions.length
                      ? "Select your pick up point"
                      : "No pickups available"
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  isDisabled={pickupOptions.length === 0}
                  aria-label="Pickup point select"
                />
                {/* )} */}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No pickup options available for this state
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Please select a state in the shipping address section first
          </div>
        )}

        <div className="pt-8 border-t border-[#E5E7EB]">
          <h3 className="text-lg text-center font-semibold mb-6">
            Shipping Calculator
          </h3>

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
                <span className="text-gray-600">
                  Expected Delivery Timeframe
                </span>
                <span className="font-medium">
                  {deliveryInfo?.duration || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="font-medium">
                  NGN {deliveryInfo?.fee || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-[#E5E7EB]">
                <span className="font-medium">Estimated total:</span>
                <span className="text-base font-semibold">
                  NGN {deliveryInfo?.fee || "-"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
