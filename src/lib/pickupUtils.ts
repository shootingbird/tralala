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
  [key: string]: unknown;
};

export const STORAGE_KEY = "pickup_details";

export type StoredPickupData = {
  state: string;
  pickup: string;
};

export const resolvePickupList = (
  existing: string[] | undefined,
  zone: ApiZone | null
): string[] => {
  if (existing?.length) return existing;
  if (zone?.pickups?.length) return zone.pickups;
  if (zone?.pickup_point) return [zone.pickup_point];
  return [];
};

export const pickupsAreEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

export const loadStoredPickup = (
  state: string,
  availablePickups: string[]
): string | null => {
  if (!state || !availablePickups.length) return null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed: StoredPickupData = JSON.parse(saved);
    if (parsed.state !== state) return null;
    return availablePickups.includes(parsed.pickup) ? parsed.pickup : null;
  } catch (err) {
    console.warn("Failed to parse pickup storage", err);
    return null;
  }
};

export const persistPickup = (state: string, pickup: string | null) => {
  if (!state) return;

  if (!pickup) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const payload: StoredPickupData = {
    state,
    pickup,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

