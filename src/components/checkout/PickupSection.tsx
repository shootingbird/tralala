"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PickupPointSelect } from "./pickup/PickupPointSelect";
import { ShippingCalculator } from "./pickup/ShippingCalculator";

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
  const [loading, setLoading] = useState(false);
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
        resetDeliveryState();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const zones = await fetchZones(
          selectedZone ?? null,
          selectedState,
          controller.signal
        );
        setZones(zones);

        const pickupPoints = extractPickupPoints(zones);
        const zoneToUse = selectedZone || zones[0];

        setCurrentZone(zoneToUse);
        setNormalizedDeliveryInfo(zoneToUse, pickupPoints);
        onDeliveryInfoChangeRef.current(zoneToUse);

        handleAutoPickupSelection(pickupPoints, zoneToUse);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Error fetching delivery info", err);
        resetDeliveryState();
        setError("Unable to load delivery information. Please try again.");
        onPickupSelectRef.current(createPickupData(null, null));
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryInfo();

    return () => controller.abort();
  }, [selectedState, selectedZone, setNormalizedDeliveryInfo]);

  const selectedPickupValue = selectedPickupPoint?.value;

  const pickupOptions: PickupOption[] = useMemo(
    () => (deliveryInfo?.pickups || []).map((p) => ({ value: p, label: p })),
    [deliveryInfo?.pickups]
  );

  // Restore saved pickup from localStorage once deliveryInfo/currentZone available
  useEffect(() => {
    if (!deliveryInfo || !currentZone) return;
    if (!deliveryInfo.pickups.length) return;

    const restored = loadStoredPickup(selectedState, deliveryInfo.pickups);
    if (!restored) return;
    if (selectedPickupValue === restored.pickup) return;

    const restoredOption = { value: restored.pickup, label: restored.pickup };

    // If we have a saved zoneId, try to find the most recent zone data
    let zoneToUse = currentZone;
    if (restored.zoneId) {
      const savedZone = zones.find((zone) => zone.id === restored.zoneId);
      if (savedZone) {
        zoneToUse = savedZone;
        setCurrentZone(savedZone);
        setNormalizedDeliveryInfo(savedZone, deliveryInfo.pickups);
      }
    }

    setSelectedPickupPoint(restoredOption);
    onPickupSelectRef.current(createPickupData(restoredOption, zoneToUse));
    onDeliveryInfoChangeRef.current(zoneToUse);
  }, [
    currentZone,
    deliveryInfo,
    selectedPickupValue,
    selectedState,
    setNormalizedDeliveryInfo,
    zones,
  ]);

  const resetDeliveryState = useCallback(() => {
    setNormalizedDeliveryInfo(null);
    setCurrentZone(null);
    setError(null);
    onDeliveryInfoChangeRef.current(null);
  }, [setNormalizedDeliveryInfo]);

  const fetchZones = async (
    selectedZone: ApiZone | null,
    selectedState: string,
    signal: AbortSignal
  ): Promise<ApiZone[]> => {
    if (selectedZone) return [selectedZone];

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("API configuration error. Please contact support.");
    }

    const url = `${apiUrl}/api/delivery/zones?state=${encodeURIComponent(
      selectedState
    )}&active=1&page=1&per_page=20`;
    const res = await fetch(url, { signal });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();
    if (!data?.zones?.length) {
      throw new Error("No delivery info available for the selected state.");
    }

    return data.zones;
  };

  const extractPickupPoints = (zones: ApiZone[]): string[] => {
    return zones
      .map((zone) => zone.pickup_point || zone.pickups || [])
      .filter((point): point is string | string[] => Boolean(point))
      .flat()
      .filter((point): point is string => typeof point === "string");
  };

  const handleAutoPickupSelection = (
    pickupPoints: string[],
    zoneToUse: ApiZone
  ) => {
    if (pickupPoints.length === 1) {
      const optionValue = pickupPoints[0];
      const autoPickup = { value: optionValue, label: optionValue };
      setSelectedPickupPoint(autoPickup);
      persistPickup(selectedState, optionValue, zoneToUse);
      onPickupSelectRef.current(createPickupData(autoPickup, zoneToUse));
    } else {
      setSelectedPickupPoint(null);
      onPickupSelectRef.current(createPickupData(null, zoneToUse));
    }
  };

  const createPickupData = useCallback(
    (pickup: PickupOption | null, zone: ApiZone | null): SelectedPickup => ({
      pickup,
      fee: String(zone?.fee ?? 0),
      duration: zone?.duration ?? "",
      zone,
    }),
    []
  );

  // When user picks from dropdown, include the full zone in onPickupSelect and update parent delivery info
  const handlePickupChange = useCallback(
    (value: PickupOption | null) => {
      setSelectedPickupPoint(value);
      if (value) {
        // Find the zone that contains this pickup point
        const selectedZoneForPickup =
          zones.find(
            (zone) =>
              zone.pickup_point === value.value ||
              (zone.pickups && zone.pickups.includes(value.value))
          ) || currentZone;

        persistPickup(
          selectedState,
          value.value,
          selectedZoneForPickup ?? null
        );
        setCurrentZone(selectedZoneForPickup ?? null);
        setNormalizedDeliveryInfo(selectedZoneForPickup ?? null);
        const pickupData = createPickupData(
          value,
          selectedZoneForPickup ?? null
        );
        onPickupSelectRef.current(pickupData);
        onDeliveryInfoChangeRef.current(selectedZoneForPickup ?? null);
      } else {
        persistPickup(selectedState, null);
        setNormalizedDeliveryInfo(currentZone);
        const pickupData = createPickupData(null, currentZone);
        onPickupSelectRef.current(pickupData);
        onDeliveryInfoChangeRef.current(currentZone);
      }
    },
    [
      selectedState,
      zones,
      currentZone,
      setNormalizedDeliveryInfo,
      createPickupData,
    ]
  );

  return (
    <div className="bg-white max-w-xl mx-auto">
      <h2 className="md:text-lg text-center font-semibold mb-8">
        Pick Up Point
      </h2>

      <div className="space-y-8">
        {selectedState ? (
          <div>
            {!loading && !error && !deliveryInfo ? (
              <div className="text-center text-gray-500">
                No pickup options available for this state
              </div>
            ) : (
              <PickupPointSelect
                selectedState={selectedState}
                loading={loading}
                error={error}
                options={pickupOptions}
                value={selectedPickupPoint}
                onChange={handlePickupChange}
              />
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Please select a state in the shipping address section first
          </div>
        )}
        <ShippingCalculator
          loading={loading}
          error={error}
          duration={deliveryInfo?.duration}
          fee={deliveryInfo?.fee}
        />
      </div>
    </div>
  );
};
