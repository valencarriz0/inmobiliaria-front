import type { GeocodingMatch } from "../types/location.ts";

export interface ConfirmedCoordinates {
  latitude: number | null;
  longitude: number | null;
  locationConfirmed: boolean;
}

export function hasValidCoordinates(latitude: unknown, longitude: unknown): latitude is number {
  return typeof latitude === "number" && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && typeof longitude === "number" && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

export function invalidateConfirmedCoordinates<T extends ConfirmedCoordinates>(value: T): T {
  return { ...value, latitude: null, longitude: null, locationConfirmed: false };
}

export function coordinatesFromMatch(match: GeocodingMatch): { latitude: number; longitude: number } | undefined {
  if (!hasValidCoordinates(match.latitude, match.longitude)) return;
  return { latitude: match.latitude, longitude: match.longitude };
}
