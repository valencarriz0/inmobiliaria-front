import { getAuthToken } from "./authStorage.ts";
import { apiRequest } from "./api.ts";
import type { City, GeocodeAddressInput, GeocodingMatch, LocationSearchResult, Province } from "../types/location.ts";

export function getProvinces(signal?: AbortSignal) {
  return apiRequest<{ provinces: Province[] }>("/locations/provinces", { signal });
}

export function getCities(provinceId?: string, signal?: AbortSignal) {
  const query = provinceId ? `?provinceId=${encodeURIComponent(provinceId)}` : "";
  return apiRequest<{ cities: City[] }>(`/locations/cities${query}`, { signal });
}

export function searchLocations(query: string, signal?: AbortSignal) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return Promise.resolve({ locations: [] as LocationSearchResult[] });
  return apiRequest<{ locations: LocationSearchResult[] }>(`/locations/search?q=${encodeURIComponent(normalizedQuery)}`, { signal });
}

export function geocodeAddress(input: GeocodeAddressInput) {
  return apiRequest<{ matches: GeocodingMatch[] }>("/locations/geocode", {
    method: "POST",
    token: getAuthToken(),
    body: {
      cityId: input.cityId,
      street: input.street.trim(),
      streetNumber: input.streetNumber?.trim() || null,
    },
  });
}
