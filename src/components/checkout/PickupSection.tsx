"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Select from "react-select";

import {
  ApiZone,
  loadStoredPickup,
  persistPickup,
  pickupsAreEqual,
  resolvePickupList,
} from "../../lib/pickupUtils";

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

export type SelectedPickup = {
  pickup: string | PickupOption | null;
  fee: string;
  duration: string;
  zone?: ApiZone | null;
};

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

  const onPickupSelectRef = useRef(onPickupSelect);
  const onDeliveryInfoChangeRef = useRef(onDeliveryInfoChange);

  useEffect(() => {
    onPickupSelectRef.current = onPickupSelect;
  }, [onPickupSelect]);

  useEffect(() => {
    onDeliveryInfoChangeRef.current = onDeliveryInfoChange;
  }, [onDeliveryInfoChange]);

  const setNormalizedDeliveryInfo = useCallback(
    (zone: ApiZone | null, fallbackPickups?: string[]) => {
      if (!zone) {
        setDeliveryInfo(null);
        return;
      }

      setDeliveryInfo((prev) => {
        const pickups =
          fallbackPickups ?? resolvePickupList(prev?.pickups, zone);
        const nextInfo = {
          fee: String(zone.fee ?? 0),
          duration: zone.duration ?? "",
          pickups,
        };

        if (
          prev &&
          prev.fee === nextInfo.fee &&
          prev.duration === nextInfo.duration &&
          pickupsAreEqual(prev.pickups, nextInfo.pickups)
        ) {
          return prev;
        }

        return nextInfo;
      });
    },
    []
  );

  // Fetch zone details using selectedZone if available, otherwise use state query
  useEffect(() => {
    const controller = new AbortController();

    const fetchDeliveryInfo = async () => {
      if (!selectedZone && !selectedState) {
        setNormalizedDeliveryInfo(null);
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
          zones = [selectedZone];
        } else {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) {
            console.error(
              "NEXT_PUBLIC_API_URL is not defined in environment variables"
            );
            setError("API configuration error. Please contact support.");
            setLoading(false);
            return;
          }

          const url = `${apiUrl}/api/delivery/zones?state=${encodeURIComponent(
            selectedState
          )}&active=1&page=1&per_page=20`;

          const res = await fetch(url, { signal: controller.signal });

          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

          const data = await res.json();

          if (data?.zones?.length > 0) {
            zones = data.zones;
          } else {
            throw new Error(
              "No delivery info available for the selected state."
            );
          }
        }

        setZones(zones);

        const pickupPoints: string[] = zones
          .map((zone) => zone.pickup_point || zone.pickups || [])
          .filter((point): point is string | string[] => Boolean(point))
          .flat()
          .filter((point): point is string => typeof point === "string");

        const zoneToUse = selectedZone || zones[0];
        setCurrentZone(zoneToUse);
        setNormalizedDeliveryInfo(zoneToUse, pickupPoints);
        onDeliveryInfoChangeRef.current(zoneToUse);

        if (pickupPoints.length === 1) {
          const optionValue = pickupPoints[0];
          const autoPickup = { value: optionValue, label: optionValue };
          setSelectedPickupPoint(autoPickup);
          persistPickup(selectedState, optionValue);
          onPickupSelectRef.current({
            pickup: autoPickup,
            fee: String(zoneToUse.fee ?? 0),
            duration: zoneToUse.duration ?? "",
            zone: zoneToUse,
          });
        } else {
          setSelectedPickupPoint(null);
          onPickupSelectRef.current({
            pickup: null,
            fee: String(zoneToUse.fee ?? 0),
            duration: zoneToUse.duration ?? "",
            zone: zoneToUse,
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Error fetching delivery info", err);
        setNormalizedDeliveryInfo(null);
        setCurrentZone(null);
        setError("Unable to load delivery information. Please try again.");
        onDeliveryInfoChangeRef.current(null);
        onPickupSelectRef.current({
          pickup: null,
          fee: "0",
          duration: "",
          zone: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryInfo();

    return () => controller.abort();
  }, [selectedState, selectedZone, setNormalizedDeliveryInfo]);

  const selectedPickupValue = selectedPickupPoint?.value;

  // Restore saved pickup from localStorage once deliveryInfo/currentZone available
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!deliveryInfo || !currentZone) return;
    if (!deliveryInfo.pickups.length) return;

    const restored = loadStoredPickup(selectedState, deliveryInfo.pickups);
    if (!restored) return;
    if (selectedPickupValue === restored) return;

    const restoredOption = { value: restored, label: restored };

    setSelectedPickupPoint(restoredOption);
    setNormalizedDeliveryInfo(currentZone, deliveryInfo.pickups);
    onPickupSelectRef.current({
      pickup: restoredOption,
      fee: deliveryInfo.fee,
      duration: deliveryInfo.duration,
      zone: currentZone,
    });

    if (currentZone) {
      onDeliveryInfoChangeRef.current(currentZone);
    }
  }, [
    currentZone,
    deliveryInfo,
    selectedPickupValue,
    selectedState,
    setNormalizedDeliveryInfo,
  ]);

  const pickupOptions: PickupOption[] = (deliveryInfo?.pickups || []).map(
    (p) => ({ value: p, label: p })
  );

  // When user picks from dropdown, include the full zone in onPickupSelect and update parent delivery info
  const handlePickupChange = (value: PickupOption | null) => {
    setSelectedPickupPoint(value);
    if (value) {
      persistPickup(selectedState, value.value);
      // Find the zone that contains this pickup point
      const selectedZoneForPickup =
        zones.find(
          (zone) =>
            zone.pickup_point === value.value ||
            (zone.pickups && zone.pickups.includes(value.value))
        ) || currentZone;

      setCurrentZone(selectedZoneForPickup ?? null);
      setNormalizedDeliveryInfo(selectedZoneForPickup ?? null);
      onPickupSelectRef.current({
        pickup: value,
        fee: String(selectedZoneForPickup?.fee ?? 0),
        duration: selectedZoneForPickup?.duration ?? "",
        zone: selectedZoneForPickup ?? null,
      });
      // ensure parent has the full zone object (requested)
      onDeliveryInfoChangeRef.current(selectedZoneForPickup ?? null);
    } else {
      persistPickup(selectedState, null);
      setNormalizedDeliveryInfo(currentZone);
      onPickupSelectRef.current({
        pickup: null,
        fee: String(currentZone?.fee ?? 0),
        duration: currentZone?.duration ?? "",
        zone: currentZone ?? null,
      });
      onDeliveryInfoChangeRef.current(currentZone);
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
