export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
}

export type LocationSearchResult =
  | (Province & { type: "province"; label: string })
  | (City & { type: "city"; label: string });

export interface GeocodingBoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

export interface GeocodingMatch {
  latitude: number;
  longitude: number;
  displayName: string;
  boundingBox: GeocodingBoundingBox | null;
}

export interface GeocodeAddressInput {
  cityId: string;
  street: string;
  streetNumber: string | null;
}
